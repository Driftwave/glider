import { createSelector } from 'reselect'
import { panelTypes } from './constants/panelConstants'

export const getActiveFeatureType = state => state.settings.featureTypes.active
export const getFeatureTypes = state => state.settings.featureTypes.all
export const getThresholds = state => state.settings.thresholds

export const getActiveDialogType = state => state.ui.activeDialog.type
export const getImageSize = state => state.ui.imageSize
export const getActivePanelType = state => state.ui.activePanel.type
export const getSelectedImageSet = state => state.ui.activePanel.selectedImages

export const getImages = state => state.collection.imageIds
export const getImageProbs = state => state.probabilities.probs
export const getPosLabelSet = state => state.labels.pos
export const getNegLabelSet = state => state.labels.neg
export const getUnkLabelSet = state => state.labels.unk

export const getCollectionId = state => state.collection.id
export const getUser = state => state.authentication.user
export const isFetchingProbs = state => state.probabilities.isFetching

export const getImageProbGetter = createSelector([getImages, getImageProbs], (images, probs) => {
  const probsMap = {}
  if (images.length === probs.length) images.forEach((img, i) => (probsMap[img] = probs[i]))
  return img => (probsMap.hasOwnProperty(img) ? probsMap[img] : undefined)
})

export const getLabeledSet = createSelector(
  [getPosLabelSet, getNegLabelSet, getUnkLabelSet],
  (posLabeled, negLabeled, unkLabeled) => posLabeled.union(negLabeled).union(unkLabeled),
)

const sortAscending = (arr, score) => arr.sort((a, b) => score(a) - score(b))
const sortDescending = (arr, score) => arr.sort((a, b) => score(b) - score(a))
const sortUncertain = (arr, score) =>
  arr.sort((a, b) => Math.abs(0.5 - score(a)) - Math.abs(0.5 - score(b)))

export const getPosProbImages = createSelector(
  [getImages, getImageProbGetter, getLabeledSet, getThresholds],
  (images, getProb, labeled, thresholds) => {
    const res = images.filter(img => {
      if (labeled.contains(img)) return false
      const prob = getProb(img)
      return prob === undefined || prob > thresholds[1]
    })
    sortDescending(res, getProb)
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
    sortAscending(res, getProb)
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
    sortUncertain(res, getProb)
    return res
  },
)

export const getPosLabelImages = createSelector(
  [getPosLabelSet, getImageProbGetter],
  (posLabelSet, getProb) => {
    const res = posLabelSet.toArray()
    sortAscending(res, getProb)
    return res
  },
)

export const getNegLabelImages = createSelector(
  [getNegLabelSet, getImageProbGetter],
  (negLabelSet, getProb) => {
    const res = negLabelSet.toArray()
    sortDescending(res, getProb)
    return res
  },
)

export const getUnkLabelImages = createSelector(
  [getUnkLabelSet, getImageProbGetter],
  (unkLabelSet, getProb) => {
    const res = unkLabelSet.toArray()
    sortDescending(res, getProb)
    return res
  },
)

export const getActiveImages = createSelector(
  [
    getPosProbImages,
    getNegProbImages,
    getUncertainImages,
    getPosLabelImages,
    getNegLabelImages,
    getUnkLabelImages,
    getActivePanelType,
  ],
  (
    posProbImages,
    negProbImages,
    uncertainImages,
    posLabelImages,
    negLabelImages,
    unkLabelImages,
    panelType,
  ) => {
    switch (panelType) {
      case panelTypes.UNCERTAIN:
        return uncertainImages
      case panelTypes.POS_PROBS:
        return posProbImages
      case panelTypes.NEG_PROBS:
        return negProbImages
      case panelTypes.POS_LABEL:
        return posLabelImages
      case panelTypes.NEG_LABEL:
        return negLabelImages
      case panelTypes.UNK_LABEL:
        return unkLabelImages
      default:
        return []
    }
  },
)

export const getNumActiveImages = createSelector(getActiveImages, images => images.length)
export const getNumImages = createSelector(getImages, images => images.length)
