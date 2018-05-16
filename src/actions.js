import {
  getPosLabelImages,
  getNegLabelImages,
  getPosLabelImageSet,
  getNegLabelImageSet,
} from './selectors'

export const INIT_APPLICATION = 'INIT_APPLICATION'
export const SWITCH_PANEL = 'SWITCH_PANEL'
export const REQUEST_COLLECTION = 'REQUEST_COLLECTION'
export const RECEIVE_COLLECTION = 'RECEIVE_COLLECTION'
export const LABEL_IMAGES = 'LABEL_IMAGES'
export const UNLABEL_IMAGES = 'UNLABEL_IMAGES'
export const REQUEST_PROBS = 'REQUEST_PROBS'
export const RECEIVE_PROBS = 'RECEIVE_PROBS'
export const RESET_PROBS = 'RESET_PROBS'

export const switchPanel = panelId => ({
  type: SWITCH_PANEL,
  panelId,
})

export const requestCollection = collectionId => ({
  type: REQUEST_COLLECTION,
  collectionId,
})

export const receiveCollection = (collectionId, imageIds) => ({
  type: RECEIVE_COLLECTION,
  collectionId,
  imageIds,
  receivedAt: Date.now(),
})

export const fetchCollection = collectionId => dispatch => {
  dispatch(requestCollection(collectionId))
  return fetch(`/api/collections/${collectionId}`)
    .then(response => response.json())
    .then(json => dispatch(receiveCollection(collectionId, json)))
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

export const fetchProbs = () => (dispatch, getState) => {
  dispatch(requestProbs())
  const state = getState()
  const pos = getPosLabelImages(state)
  const neg = getNegLabelImages(state)
  const collectionId = state.collection.collectionId
  return fetch('/api/classify', {
    method: 'post',
    body: JSON.stringify({ pos, neg, collectionId }),
  })
    .then(response => response.json(), error => console.log(error))
    .then(json => dispatch(receiveProbs(json)))
}

export const labelImages = (pos, neg) => (dispatch, getState) => {
  const labeledPos = getPosLabelImageSet(getState())
  const labeledNeg = getNegLabelImageSet(getState())
  if (labeledPos.isSuperset(pos) && labeledNeg.isSuperset(neg)) {
    // No-op!
    return
  }
  dispatch({ type: LABEL_IMAGES, pos, neg })
  dispatch(fetchProbs())
}

export const unlabelImages = imageIds => (dispatch, getState) => {
  const state = getState()
  const labeledPos = getPosLabelImageSet(state)
  const labeledNeg = getNegLabelImageSet(state)
  if (
    labeledPos
      .union(labeledNeg)
      .intersect(imageIds)
      .isEmpty()
  ) {
    // No-op!
    return
  }
  dispatch({ type: UNLABEL_IMAGES, imageIds })
  let newState = getState()
  let nowLabeled = getPosLabelImageSet(newState).union(getNegLabelImageSet(newState))
  if (nowLabeled.size === 0) {
    dispatch(resetProbs())
  } else {
    dispatch(fetchProbs())
  }
}

export const initApplication = () => dispatch => dispatch(fetchCollection('unsplash'))
