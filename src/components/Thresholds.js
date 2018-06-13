import React from 'react'
import { connect } from 'react-redux'
import { RangeSlider } from '@blueprintjs/core'
import { setThresholds } from '../actionCreators'
import { getThresholds } from '../selectors'

const Thresholds = ({ setThresholds, value }) => (
	<RangeSlider
		min={0}
		max={1}
		stepSize={0.05}
		labelStepSize={0.5}
		showTrackFill={false}
		value={value}
		onChange={newValue => setThresholds(newValue)}
	/>
)

const mapDispatchToProps = dispatch => ({
	setThresholds: value => dispatch(setThresholds(value)),
})
const mapStateToProps = state => ({
	value: getThresholds(state),
})
export default connect(mapStateToProps, mapDispatchToProps)(Thresholds)
