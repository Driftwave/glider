import { Intent } from '@blueprintjs/core'
import * as types from './constants/actionTypes'
import * as dialogTypes from './constants/dialogTypes'
import {
    getPosLabelSet,
    getNegLabelSet,
    getUnkLabelSet,
    getSelectedImageSet,
    getCollectionId,
    getActiveFeatureType,
} from './selectors'
import { AppToaster } from './toaster'

export const openDialog = value => ({
    type: types.OPEN_DIALOG,
    value,
})
export const closeDialog = value => ({
    type: types.CLOSE_DIALOG,
    value,
})

export const setThresholds = value => ({
    type: types.SET_THRESHOLDS,
    value,
})

export const increaseImageSize = () => ({
    type: types.INCREASE_IMAGE_SIZE,
})

export const decreaseImageSize = () => ({
    type: types.DECREASE_IMAGE_SIZE,
})

export const clearSelected = () => ({
    type: types.CLEAR_SELECTED,
})

export const toggleSelected = imageIds => ({
    type: types.TOGGLE_SELECTED,
    imageIds,
})

export const switchPanel = value => ({
    type: types.SWITCH_PANEL,
    value,
})

export const requestCollection = id => ({
    type: types.REQUEST_COLLECTION,
    id,
})

export const receiveCollection = (id, imageIds) => ({
    type: types.RECEIVE_COLLECTION,
    payload: { id, imageIds },
    receivedAt: Date.now(),
})

export const fetchCollection = id => dispatch => {
    dispatch(requestCollection(id))
    return fetch(`/api/collections/${id}`)
        .then(response => response.json())
        .then(probs => dispatch(receiveCollection(id, probs)))
}

export const resetProbs = () => ({
    type: types.RESET_PROBS,
})

export const requestProbs = () => ({
    type: types.REQUEST_PROBS,
})

export const receiveProbs = probs => ({
    type: types.RECEIVE_PROBS,
    payload: { probs },
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
    dispatch({ type: types.SET_ACTIVE_FEATURE_TYPE, value })
    dispatch(fetchProbs())
}

export const requestFeatureTypes = () => ({
    type: types.REQUEST_FEATURE_TYPES,
})
export const receiveFeatureTypes = payload => ({
    type: types.RECEIVE_FEATURE_TYPES,
    payload,
    receivedAt: Date.now(),
})
export const fetchFeatureTypes = () => dispatch => {
    dispatch(requestFeatureTypes())
    return fetch('/api/feature-types')
        .then(response => response.json())
        .then(value => dispatch(receiveFeatureTypes(value)))
}

export const requestTagData = () => ({
    type: types.REQUEST_TAG_DATA,
})
export const receiveTagData = payload => ({
    type: types.RECEIVE_TAG_DATA,
    payload,
    receivedAt: Date.now(),
})
export const loadTagData = (tag, user) => dispatch => {
    dispatch(requestTagData())
    AppToaster.show({
        intent: Intent.WARNING,
        icon: 'build',
        message: `Loading tag: ${tag} (${user})`,
        timeout: 0,
    })
    return fetch(`/api/tags/${tag}/${user}`)
        .then(response => {
            if (response.ok) return response.json()
            else throw new Error('Server Failure')
        })
        .then(data => {
            dispatch(receiveTagData(data))
            dispatch(fetchProbs(false))
        })
        .catch(error => {
            console.log(error)
            AppToaster.show({
                intent: Intent.DANGER,
                icon: 'warning-sign',
                message: 'Load tag failed!',
            })
        })
}

export const fetchProbs = (initialToast = true) => (dispatch, getState) => {
    const state = getState()
    const pos = getPosLabelSet(state).toArray()
    const neg = getNegLabelSet(state).toArray()
    if (pos.length === 0 && neg.length === 0) {
        return
    }

    const collectionId = getCollectionId(state)
    const featureType = getActiveFeatureType(state)

    dispatch(requestProbs())
    if (initialToast)
        AppToaster.show({
            intent: Intent.WARNING,
            icon: 'build',
            message: 'Training model...',
            timeout: 0,
        })
    return fetch('/api/classify', {
        method: 'post',
        body: JSON.stringify({ pos, neg, collectionId, featureType }),
    })
        .then(response => {
            if (response.ok) return response.json()
            else throw new Error('Server Failure')
        })
        .then(data => {
            dispatch(clearSelected())
            dispatch(receiveProbs(data))
            AppToaster.clear()
            AppToaster.show({
                intent: Intent.PRIMARY,
                icon: 'tick',
                message: `Success!`,
                timeout: 1000,
            })
        })
        .catch(error => {
            console.log(error)
            AppToaster.show({
                intent: Intent.DANGER,
                icon: 'warning-sign',
                message: 'Model training failed!',
            })
        })
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
                    intent: Intent.PRIMARY,
                    icon: 'tick',
                    message: 'Saved Tag!',
                    timeout: 1500,
                })
            } else throw new Error('Server Failure')
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
    dispatch({ type: types.LABEL_IMAGES, pos, neg, unk })
    if (prevLabeledPos.isSuperset(pos) && prevLabeledNeg.isSuperset(neg)) {
        // no need to re-fetch probs since pos and neg examples have not changed
        return
    }
    dispatch(fetchProbs())
}

export const unlabelImages = imageIds => (dispatch, getState) => {
    const state = getState()
    const prevLabeled = getPosLabelSet(state).union(getNegLabelSet(state))
    dispatch({ type: types.UNLABEL_IMAGES, imageIds })
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
