import React from 'react'
import { connect } from 'react-redux'
import { ClipLoader } from 'react-spinners'
import { Intent } from '@blueprintjs/core'
import ImageGallery from '../components/ImageGallery'
import { getActiveImages, getImageSize, isFetchingProbs, isFetchingTag } from '../selectors'

const MainPanel = ({ imageIds, imageSize, isLoading }) => {
	if (isLoading)
		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					minHeight: '80vh',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<ClipLoader size={200} />
			</div>
		)
	else return <ImageGallery imageIds={imageIds} imageSize={imageSize} />
}

export default connect(state => {
	const imageIds = getActiveImages(state)
	const imageSize = getImageSize(state)
	const isLoading = isFetchingProbs(state) || isFetchingTag(state)
	return { imageIds, imageSize, isLoading }
})(MainPanel)
