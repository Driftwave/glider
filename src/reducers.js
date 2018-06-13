import { combineReducers } from 'redux'
import { OrderedSet } from 'immutable'
import { POS_PROBS } from './containers/Panels'
import {
    SWITCH_PANEL,
    REQUEST_COLLECTION,
    RECEIVE_COLLECTION,
    REQUEST_PROBS,
    RECEIVE_PROBS,
    RESET_PROBS,
    LABEL_IMAGES,
    UNLABEL_IMAGES,
    TOGGLE_SELECTED,
    CLEAR_SELECTED,
    INCREASE_IMAGE_SIZE,
    DECREASE_IMAGE_SIZE,
    SET_THRESHOLDS,
    SET_ACTIVE_FEATURE_TYPE,
    REQUEST_FEATURE_TYPES,
    RECEIVE_FEATURE_TYPES,
    REQUEST_TAG_DATA,
    RECEIVE_TAG_DATA,
} from './actions'

function featureTypes(state = { all: [], active: undefined, isFetching: false }, action) {
    switch (action.type) {
        case SET_ACTIVE_FEATURE_TYPE:
            return Object.assign({}, state, { active: action.value })
        case REQUEST_FEATURE_TYPES:
            return Object.assign({}, state, { isFetching: true })
        case RECEIVE_FEATURE_TYPES:
            return Object.assign({}, action.value, {
                isFetching: false,
                receivedAt: action.receivedAt,
            })
        default:
            return state
    }
}

function thresholds(state = [0.3, 0.7], action) {
    switch (action.type) {
        case SET_THRESHOLDS:
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
        case INCREASE_IMAGE_SIZE:
            if (index + 1 < imageSizes.length) return imageSizes[index + 1]
            else return state
        case DECREASE_IMAGE_SIZE:
            if (index > 0) return imageSizes[index - 1]
            else return state
        default:
            return state
    }
}

function activePanel(state = { id: POS_PROBS, selected: OrderedSet() }, action) {
    switch (action.type) {
        case SWITCH_PANEL:
            return { id: action.id, selected: OrderedSet() }
        case TOGGLE_SELECTED:
            const alreadySelected = state.selected.intersect(action.imageIds)
            const selected = state.selected.union(action.imageIds).subtract(alreadySelected)
            return Object.assign({}, state, { selected })
        case CLEAR_SELECTED:
            return Object.assign({}, state, { selected: OrderedSet() })
        default:
            return state
    }
}

function collection(state = { imageIds: [], isFetching: false }, action) {
    switch (action.type) {
        case REQUEST_COLLECTION:
            return Object.assign({}, state, {
                isFetching: true,
            })
        case RECEIVE_COLLECTION:
            return Object.assign({}, state, {
                isFetching: false,
                id: action.id,
                imageIds: action.imageIds,
                receivedAt: action.receivedAt,
            })
        default:
            return state
    }
}

function probabilities(state = { probs: [], isFetching: false }, action) {
    switch (action.type) {
        case REQUEST_PROBS:
            return Object.assign({}, state, {
                isFetching: true,
            })
        case RECEIVE_PROBS:
            return Object.assign({}, state, {
                probs: action.probs,
                isFetching: false,
                receivedAt: action.receivedAt,
            })
        case RESET_PROBS:
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
        case LABEL_IMAGES:
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
            return Object.assign({}, state, { pos, neg, unk })
        case UNLABEL_IMAGES:
            pos = state.pos.subtract(action.imageIds)
            neg = state.neg.subtract(action.imageIds)
            unk = state.unk.subtract(action.imageIds)
            return Object.assign({}, state, { pos, neg, unk })
        case REQUEST_TAG_DATA:
            return Object.assign({}, state, { isFetching: true })
        case RECEIVE_TAG_DATA:
            return {
                pos: OrderedSet(action.value.pos),
                neg: OrderedSet(action.value.neg),
                unk: OrderedSet(action.value.unk),
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
    imageSize,
    activePanel,
    collection,
    probabilities,
    labels,
    thresholds,
    featureTypes,
    authentication,
})
