import React from "react";
import { connect } from "react-redux";
import ImageGalleryComponent from "../components/ImageGallery";
import {
  getPosProbImages,
  getNegProbImages,
  getUncertainImages,
  getPosLabelImages,
  getNegLabelImages,
  getActivePanel
} from "../selectors";

export const panelIds = {
  UNCERTAIN: "Uncertain",
  POS_PROBS: "Positive",
  NEG_PROBS: "Negative",
  POS_LABEL: "Labeled Positive",
  NEG_LABEL: "Labeled Negative"
};

const Panel = connect(state => ({
  activePanel: getActivePanel(state)
}))(({ activePanel }) => {
  switch (activePanel) {
    case panelIds.UNCERTAIN:
      return <UncertainPanel />;
    case panelIds.POS_PROBS:
      return <PosProbsPanel />;
    case panelIds.NEG_PROBS:
      return <NegProbsPanel />;
    case panelIds.POS_LABEL:
      return <PosLabelPanel />;
    case panelIds.NEG_LABEL:
      return <NegLabelPanel />;
    default:
      return <div />;
  }
});

export default Panel;

const UncertainPanel = connect(state => ({
  imageIds: getUncertainImages(state)
}))(ImageGalleryComponent);

const PosProbsPanel = connect(state => ({
  imageIds: getPosProbImages(state)
}))(ImageGalleryComponent);

const NegProbsPanel = connect(state => ({
  imageIds: getNegProbImages(state)
}))(ImageGalleryComponent);

const PosLabelPanel = connect(state => ({
  imageIds: getPosLabelImages(state)
}))(ImageGalleryComponent);

const NegLabelPanel = connect(state => ({
  imageIds: getNegLabelImages(state)
}))(ImageGalleryComponent);
