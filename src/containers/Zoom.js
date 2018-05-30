import React from 'react'
import { connect } from 'react-redux'
import { Button, ButtonGroup } from '@blueprintjs/core'
import { increaseImageSize, decreaseImageSize } from '../actions'

const Zoom = ({ increase, decrease }) => (
	<ButtonGroup>
		<Button icon="zoom-out" onClick={decrease} />
		<Button icon="zoom-in" onClick={increase} />
	</ButtonGroup>
)

const mapDispatchToProps = dispatch => ({
	increase: () => dispatch(increaseImageSize()),
	decrease: () => dispatch(decreaseImageSize()),
})

export default connect(null, mapDispatchToProps)(Zoom)
