import { Intent } from '@blueprintjs/core'
import {
  getPosLabelSet,
  getNegLabelSet,
  getUnkLabelSet,
  getSelectedImageSet,
  getCollectionId,
  getActiveFeatureType,
} from './selectors'

import { AppToaster } from './toaster'

export const INIT_APPLICATION = 'INIT_APPLICATION'
export const REQUEST_COLLECTION = 'REQUEST_COLLECTION'
export const RECEIVE_COLLECTION = 'RECEIVE_COLLECTION'
export const LABEL_IMAGES = 'LABEL_IMAGES'
export const UNLABEL_IMAGES = 'UNLABEL_IMAGES'
export const REQUEST_PROBS = 'REQUEST_PROBS'
export const RECEIVE_PROBS = 'RECEIVE_PROBS'
export const RESET_PROBS = 'RESET_PROBS'
export const TOGGLE_SELECTED = 'TOGGLE_SELECTED'
export const CLEAR_SELECTED = 'CLEAR_SELECTED'
export const INCREASE_IMAGE_SIZE = 'INCREASE_IMAGE_SIZE'
export const DECREASE_IMAGE_SIZE = 'DECREASE_IMAGE_SIZE'
export const SET_THRESHOLDS = 'SET_THRESHOLDS'
export const SET_ACTIVE_FEATURE_TYPE = 'SET_ACTIVE_FEATURE_TYPE'
export const RECEIVE_FEATURE_TYPES = 'RECEIVE_FEATURE_TYPES'
export const REQUEST_FEATURE_TYPES = 'REQUEST_FEATURE_TYPES'
export const REQUEST_TAG_DATA = 'REQUEST_TAG_DATA'
export const RECEIVE_TAG_DATA = 'RECEIVE_TAG_DATA'

//UI actions
export const SWITCH_PANEL = 'SWITCH_PANEL'

export const setThresholds = value => ({
  type: SET_THRESHOLDS,
  value,
})

export const increaseImageSize = () => ({
  type: INCREASE_IMAGE_SIZE,
})

export const decreaseImageSize = () => ({
  type: DECREASE_IMAGE_SIZE,
})

export const clearSelected = () => ({
  type: CLEAR_SELECTED,
})

export const toggleSelected = imageIds => ({
  type: TOGGLE_SELECTED,
  imageIds,
})

export const switchPanel = id => ({
  type: SWITCH_PANEL,
  id,
})

export const requestCollection = id => ({
  type: REQUEST_COLLECTION,
  id,
})

export const receiveCollection = (id, imageIds) => ({
  type: RECEIVE_COLLECTION,
  id,
  imageIds,
  receivedAt: Date.now(),
})

export const fetchCollection = id => dispatch => {
  dispatch(requestCollection(id))
  return fetch(`/api/collections/${id}`)
    .then(response => response.json())
    .then(probs => dispatch(receiveCollection(id, probs)))
}

export const resetProbs = () => ({
  type: RESET_PROBS,
})

export const requestProbs = () => ({
  type: REQUEST_PROBS,
})

export const receiveProbs = probs => ({
  type: RECEIVE_PROBS,
  probs,
  receivedAt: Date.now(),
})

export const labelSelectedPos = () => (dispatch, getState) =>
  dispatch(labelImages(getSelectedImageSet(getState()), [], []))

export const labelSelectedNeg = () => (dispatch, getState) =>
  dispatch(labelImages([], getSelectedImageSet(getState()), []))

export const labelSelectedUnk = () => (dispatch, getState) =>
  dispatch(labelImages([], [], getSelectedImageSet(getState())))

export const unlabelSelected = () => (dispatch, getState) =>
  dispatch(unlabelImages(getSelectedImageSet(getState())))

export const labelPosFlipSelected = imageSet => (dispatch, getState) => {
  const selected = getSelectedImageSet(getState())
  const pos = imageSet.subtract(selected)
  const neg = imageSet.intersect(selected)
  dispatch(labelImages(pos, neg, []))
}

export const labelNegFlipSelected = imageSet => (dispatch, getState) => {
  const selected = getSelectedImageSet(getState())
  const pos = imageSet.intersect(selected)
  const neg = imageSet.subtract(selected)
  dispatch(labelImages(pos, neg, []))
}

export const setActiveFeatureType = value => dispatch => {
  dispatch({ type: SET_ACTIVE_FEATURE_TYPE, value })
  dispatch(fetchProbs())
}

export const requestFeatureTypes = () => ({
  type: REQUEST_FEATURE_TYPES,
})
export const receiveFeatureTypes = value => ({
  type: RECEIVE_FEATURE_TYPES,
  value,
  receivedAt: Date.now(),
})
export const fetchFeatureTypes = () => dispatch => {
  dispatch(requestFeatureTypes())
  return fetch('/api/feature-types')
    .then(response => response.json())
    .then(value => dispatch(receiveFeatureTypes(value)))
}

export const requestTagData = () => ({
  type: REQUEST_TAG_DATA,
})
export const receiveTagData = value => ({
  type: RECEIVE_TAG_DATA,
  value,
  receivedAt: Date.now(),
})
export const fetchTagData = (tag, user) => dispatch => {
  dispatch(requestTagData())
  return fetch(`/api/tags/${tag}/${user}`)
    .then(response => {
      if (response.ok) {
        AppToaster.show({
          intent: Intent.SUCCESS,
          icon: 'tick',
          message: `Loaded tag: ${tag} (${user})`,
        })
        return response.json()
      } else {
        throw new Error('Server Failure')
      }
    })
    .then(value => dispatch(receiveTagData(value)))
    .then(() => dispatch(resetProbs()))
    .then(() => dispatch(fetchProbs()))
    .catch(error => {
      console.log(error)
      AppToaster.show({
        intent: Intent.DANGER,
        icon: 'warning-sign',
        message: 'Load tag failed!',
      })
    })
}

export const fetchProbs = () => (dispatch, getState) => {
  const state = getState()
  const pos = getPosLabelSet(state).toArray()
  const neg = getNegLabelSet(state).toArray()
  if (pos.length === 0 && neg.length === 0) {
    return
  }

  const collectionId = getCollectionId(state)
  const featureType = getActiveFeatureType(state)

  dispatch(requestProbs())
  return fetch('/api/classify', {
    method: 'post',
    body: JSON.stringify({ pos, neg, collectionId, featureType }),
  })
    .then(response => response.json(), error => console.log(error))
    .then(json => dispatch(receiveProbs(json)))
    .then(() => dispatch(clearSelected()))
}

export const saveTagData = (tag, user) => (dispatch, getState) => {
  const state = getState()
  const pos = getPosLabelSet(state).toArray()
  const neg = getNegLabelSet(state).toArray()
  const unk = getUnkLabelSet(state).toArray()

  fetch(`/api/tags/${tag}/${user}`, {
    method: 'post',
    body: JSON.stringify({ pos, neg, unk }),
  })
    .then(response => {
      if (response.ok) {
        AppToaster.show({
          intent: Intent.SUCCESS,
          icon: 'tick',
          message: 'Saved Tag!',
        })
      } else {
        throw new Error('Server Failure')
      }
    })
    .catch(error =>
      AppToaster.show({
        intent: Intent.DANGER,
        icon: 'warning-sign',
        message: 'Save failed!',
      }),
    )
}

export const labelImages = (pos, neg, unk) => (dispatch, getState) => {
  const prevLabeledPos = getPosLabelSet(getState())
  const prevLabeledNeg = getNegLabelSet(getState())
  dispatch({ type: LABEL_IMAGES, pos, neg, unk })
  if (prevLabeledPos.isSuperset(pos) && prevLabeledNeg.isSuperset(neg)) {
    // no need to re-fetch probs since pos and neg examples have not changed
    return
  }
  dispatch(fetchProbs())
}

export const unlabelImages = imageIds => (dispatch, getState) => {
  const state = getState()
  const prevLabeled = getPosLabelSet(state).union(getNegLabelSet(state))
  dispatch({ type: UNLABEL_IMAGES, imageIds })
  if (prevLabeled.intersect(imageIds).isEmpty()) {
    // No-op!
    return
  }

  const newState = getState()
  const nowLabeled = getPosLabelSet(newState).union(getNegLabelSet(newState))
  if (nowLabeled.size === 0) {
    dispatch(resetProbs())
  } else {
    dispatch(fetchProbs())
  }
}

export const initApplication = () => dispatch => {
  dispatch(fetchFeatureTypes())
  dispatch(fetchCollection('unsplash'))
}
