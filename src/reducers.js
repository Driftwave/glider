import { combineReducers } from "redux";
import { OrderedSet } from "immutable";
import { panelIds } from "./containers/Panels";
import {
  SWITCH_PANEL,
  REQUEST_COLLECTION,
  RECEIVE_COLLECTION,
  REQUEST_PROBS,
  RECEIVE_PROBS,
  RESET_PROBS,
  LABEL_IMAGES,
  UNLABEL_IMAGES
} from "./actions";

function activePanel(state = panelIds.UNCERTAIN, action) {
  switch (action.type) {
    case SWITCH_PANEL:
      return action.panelId;
    default:
      return state;
  }
}

function collection(state = { imageIds: [], isFetching: false }, action) {
  switch (action.type) {
    case REQUEST_COLLECTION:
      return Object.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_COLLECTION:
      return Object.assign({}, state, {
        isFetching: false,
        collectionId: action.collectionId,
        imageIds: action.imageIds,
        receivedAt: action.receivedAt
      });
    default:
      return state;
  }
}

function probabilities(state = { probs: [], isFetching: false }, action) {
  switch (action.type) {
    case REQUEST_PROBS:
      return Object.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_PROBS:
      return Object.assign({}, state, {
        probs: action.probs,
        isFetching: false,
        receivedAt: action.receivedAt
      });
    case RESET_PROBS:
      return Object.assign({}, state, { probs: [] });
    default:
      return state;
  }
}

function labels(state = { pos: OrderedSet(), neg: OrderedSet() }, action) {
  let pos, neg;
  switch (action.type) {
    case LABEL_IMAGES:
      pos = state.pos.subtract(action.neg).union(action.pos);
      neg = state.neg.subtract(action.pos).union(action.neg);
      return Object.assign({}, state, { pos, neg });
    case UNLABEL_IMAGES:
      pos = state.pos.subtract(action.imageIds);
      neg = state.neg.subtract(action.imageIds);
      return Object.assign({}, state, { pos, neg });
    default:
      return state;
  }
}

export default combineReducers({
  activePanel,
  collection,
  probabilities,
  labels
});
