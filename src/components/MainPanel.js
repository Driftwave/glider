import { connect } from 'react-redux'
import ImageGallery from '../components/ImageGallery'
import { getActiveImages, getImageSize, isFetchingProbs } from '../selectors'

export default connect(state => {
	const imageIds = getActiveImages(state)
	const imageSize = getImageSize(state)
	const isFetching = isFetchingProbs(state)
	return { imageIds, imageSize, isFetching }
})(ImageGallery)
