import { createSelector } from 'reselect'
import {
  UNCERTAIN,
  POS_PROBS,
  NEG_PROBS,
  POS_LABEL,
  NEG_LABEL,
  UNK_LABEL,
} from './containers/Panels'

export const getImageSize = state => state.imageSize
export const getActivePanelId = state => state.activePanel.id
export const getSelectedImageSet = state => state.activePanel.selected
export const getImages = state => state.collection.imageIds
export const getImageProbs = state => state.probabilities.probs
export const getPosLabelSet = state => state.labels.pos
export const getNegLabelSet = state => state.labels.neg
export const getUnkLabelSet = state => state.labels.unk
export const getThresholds = state => state.thresholds
export const getFeatureType = state => state.featureType
export const getCollectionId = state => state.collection.id

export const getImageProbGetter = createSelector([getImages, getImageProbs], (images, probs) => {
  const probsMap = {}
  if (images.length === probs.length) images.forEach((img, i) => (probsMap[img] = probs[i]))
  return img => (probsMap.hasOwnProperty(img) ? probsMap[img] : undefined)
})

export const getLabeledSet = createSelector(
  [getPosLabelSet, getNegLabelSet, getUnkLabelSet],
  (posLabeled, negLabeled, unkLabeled) => posLabeled.union(negLabeled).union(unkLabeled),
)

export const getPosProbImages = createSelector(
  [getImages, getImageProbGetter, getLabeledSet, getThresholds],
  (images, getProb, labeled, thresholds) => {
    const res = images.filter(img => {
      if (labeled.contains(img)) return false
      const prob = getProb(img)
      return prob === undefined || prob > thresholds[1]
    })
    res.sort((a, b) => getProb(b) - getProb(a))
    return res
  },
)

export const getNegProbImages = createSelector(
  [getImages, getImageProbGetter, getLabeledSet, getThresholds],
  (images, getProb, labeled, thresholds) => {
    const res = images.filter(img => {
      if (labeled.contains(img)) return false
      const prob = getProb(img)
      return prob < thresholds[0]
    })
    res.sort((a, b) => getProb(a) - getProb(b))
    return res
  },
)

export const getUncertainImages = createSelector(
  [getImages, getImageProbGetter, getLabeledSet, getThresholds],
  (images, getProb, labeled, thresholds) => {
    const res = images.filter(img => {
      if (labeled.contains(img)) return false
      const prob = getProb(img)
      return prob >= thresholds[0] && prob <= thresholds[1]
    })
    res.sort((a, b) => Math.abs(0.5 - getProb(a)) - Math.abs(0.5 - getProb(b)))
    return res
  },
)

export const getActiveImages = createSelector(
  [
    getPosProbImages,
    getNegProbImages,
    getUncertainImages,
    getPosLabelSet,
    getNegLabelSet,
    getUnkLabelSet,
    getActivePanelId,
  ],
  (
    posProbImages,
    negProbImages,
    uncertainImages,
    posLabelSet,
    negLabelSet,
    unkLabelSet,
    panelId,
  ) => {
    switch (panelId) {
      case UNCERTAIN:
        return uncertainImages
      case POS_PROBS:
        return posProbImages
      case NEG_PROBS:
        return negProbImages
      case POS_LABEL:
        return posLabelSet.toArray()
      case NEG_LABEL:
        return negLabelSet.toArray()
      case UNK_LABEL:
        return unkLabelSet.toArray()
      default:
        return []
    }
  },
)

export const getNumActiveImages = createSelector(getActiveImages, images => images.length)
export const getNumImages = createSelector(getImages, images => images.length)
