import { createSelector } from "reselect";

export const getActivePanel = state => state.activePanel;
export const getImages = state => state.collection.imageIds;
export const getImageProbs = state => state.probabilities.probs;
export const getPosLabelImageSet = state => state.labels.pos;
export const getNegLabelImageSet = state => state.labels.neg;
export const getPosLabelImages = state => state.labels.pos.toArray();
export const getNegLabelImages = state => state.labels.neg.toArray();

export const getImageProbGetter = createSelector(
  [getImages, getImageProbs],
  (images, probs) => {
    const probsMap = {};
    if (images.length === probs.length)
      images.forEach((img, i) => (probsMap[img] = probs[i]));
    return img => (probsMap.hasOwnProperty(img) ? probsMap[img] : 0.5);
  }
);

export const getPosProbImages = createSelector(
  [getImages, getImageProbGetter],
  (images, getProb) => {
    const res = images.filter(img => getProb(img) > 0.7);
    res.sort((a, b) => getProb(b) - getProb(a));
    return res;
  }
);

export const getNegProbImages = createSelector(
  [getImages, getImageProbGetter],
  (images, getProb) => {
    const res = images.filter(img => getProb(img) < 0.3);
    res.sort((a, b) => getProb(a) - getProb(b));
    return res;
  }
);

export const getUncertainImages = createSelector(
  [getImages, getImageProbGetter],
  (images, getProb) => {
    const res = images.filter(
      img => getProb(img) >= 0.3 && getProb(img) <= 0.7
    );
    res.sort((a, b) => Math.abs(0.5 - getProb(a)) - Math.abs(0.5 - getProb(b)));
    return res;
  }
);
