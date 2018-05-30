import React from 'react'
import { connect } from 'react-redux'
import { Callout } from '@blueprintjs/core'
import { getNumActiveImages, getNumImages } from '../selectors'

const Stats = ({ numImages, numActiveImages }) => (
	<Callout icon="pulse"> {`${numActiveImages} / ${numImages} Images`} </Callout>
)
export default connect(state => ({
	numImages: getNumImages(state),
	numActiveImages: getNumActiveImages(state),
}))(Stats)
