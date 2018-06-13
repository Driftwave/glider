import { combineReducers } from 'redux'
import { OrderedSet } from 'immutable'
import * as types from './constants/actionTypes'
import { panelTypes } from './constants/panelConstants'

function featureTypes(state = { all: [], active: null, isFetching: false }, action) {
    switch (action.type) {
        case types.SET_ACTIVE_FEATURE_TYPE:
            return { ...state, ...action.payload }
        case types.REQUEST_FEATURE_TYPES:
            return { ...state, isFetching: true }
        case types.RECEIVE_FEATURE_TYPES:
            return { ...action.payload, isFetching: false, receivedAt: action.receivedAt }
        default:
            return state
    }
}

function thresholds(state = [0.3, 0.7], action) {
    switch (action.type) {
        case types.SET_THRESHOLDS:
            return action.value
        default:
            return state
    }
}

const defaultImageSize = 331
const imageSizes = [128, 331]

function imageSize(state = defaultImageSize, action) {
    const index = imageSizes.indexOf(state)
    switch (action.type) {
        case types.INCREASE_IMAGE_SIZE:
            if (index + 1 < imageSizes.length) return imageSizes[index + 1]
            else return state
        case types.DECREASE_IMAGE_SIZE:
            if (index > 0) return imageSizes[index - 1]
            else return state
        default:
            return state
    }
}

function activePanel(state = { type: panelTypes.POS_PROBS, selectedImages: OrderedSet() }, action) {
    switch (action.type) {
        case types.SWITCH_PANEL:
            return { type: action.value, selectedImages: OrderedSet() }
        case types.TOGGLE_SELECTED:
            const alreadySelected = state.selectedImages.intersect(action.imageIds)
            const selectedImages = state.selectedImages
                .union(action.imageIds)
                .subtract(alreadySelected)
            return { ...state, selectedImages }
        case types.CLEAR_SELECTED:
            return { ...state, selectedImages: OrderedSet() }
        default:
            return state
    }
}

function activeDialog(state = { type: null }, action) {
    switch (action.type) {
        case types.OPEN_DIALOG:
            return { ...state, type: action.value }
        case types.CLOSE_DIALOG:
            if (state.type === action.value) return { ...state, type: null }
            else return state
        default:
            return state
    }
}

function collection(state = { id: null, imageIds: [], isFetching: false }, action) {
    switch (action.type) {
        case types.REQUEST_COLLECTION:
            return { ...state, isFetching: true }
        case types.RECEIVE_COLLECTION:
            return {
                ...state,
                ...action.payload,
                isFetching: false,
                receivedAt: action.receivedAt,
            }
        default:
            return state
    }
}

function probabilities(state = { probs: [], isFetching: false }, action) {
    switch (action.type) {
        case types.REQUEST_PROBS:
            return { ...state, isFetching: true }
        case types.RECEIVE_PROBS:
            return {
                ...state,
                ...action.payload,
                isFetching: false,
                receivedAt: action.receivedAt,
            }
        case types.RESET_PROBS:
            return Object.assign({}, state, { probs: [] })
        default:
            return state
    }
}

function labels(
    state = { pos: OrderedSet(), neg: OrderedSet(), unk: OrderedSet(), isFetching: false },
    action,
) {
    let pos, neg, unk
    switch (action.type) {
        case types.LABEL_IMAGES:
            pos = state.pos
                .subtract(action.neg)
                .subtract(action.unk)
                .union(action.pos)
            neg = state.neg
                .subtract(action.pos)
                .subtract(action.unk)
                .union(action.neg)
            unk = state.unk
                .subtract(action.pos)
                .subtract(action.neg)
                .union(action.unk)
            return { ...state, pos, neg, unk }
        case types.UNLABEL_IMAGES:
            pos = state.pos.subtract(action.imageIds)
            neg = state.neg.subtract(action.imageIds)
            unk = state.unk.subtract(action.imageIds)
            return { ...state, pos, neg, unk }
        case types.REQUEST_TAG_DATA:
            return { ...state, isFetching: true }
        case types.RECEIVE_TAG_DATA:
            return {
                pos: OrderedSet(action.payload.pos),
                neg: OrderedSet(action.payload.neg),
                unk: OrderedSet(action.payload.unk),
                isFetching: false,
                receivedAt: action.recevedAt,
            }
        default:
            return state
    }
}

function authentication(state = { user: 'ben' }, action) {
    switch (action.type) {
        default:
            return state
    }
}

export default combineReducers({
    ui: combineReducers({ imageSize, activePanel, activeDialog }),
    settings: combineReducers({ featureTypes, thresholds }),
    collection,
    probabilities,
    labels,
    authentication,
})
