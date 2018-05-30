import { connect } from 'react-redux'
import ImageGalleryComponent from '../components/ImageGallery'
import { getActiveImages, getImageSize } from '../selectors'

// Panel IDs
export const UNCERTAIN = 'UNCERTAIN'
export const POS_PROBS = 'POS_PROBS'
export const NEG_PROBS = 'NEG_PROBS'
export const POS_LABEL = 'POS_LABEL'
export const NEG_LABEL = 'NEG_LABEL'
export const UNK_LABEL = 'UNK_LABEL'

export const predictPanelIds = [UNCERTAIN, POS_PROBS, NEG_PROBS]
export const labeledPanelIds = [POS_LABEL, NEG_LABEL, UNK_LABEL]

export const panelNames = {
  UNCERTAIN: 'Uncertain',
  POS_PROBS: 'Positive',
  NEG_PROBS: 'Negative',
  POS_LABEL: 'Marked Positive',
  NEG_LABEL: 'Marked Negative',
  UNK_LABEL: 'Marked Uncertain',
}

export default connect(state => {
  const imageIds = getActiveImages(state)
  const imageSize = getImageSize(state)
  return { imageIds, imageSize }
})(ImageGalleryComponent)
