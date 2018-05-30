import React from 'react'
import { connect } from 'react-redux'
import { Button, MenuItem } from '@blueprintjs/core'
import { Select } from '@blueprintjs/select'
import { setFeatureType, fetchProbs } from '../actions'
import { getFeatureType } from '../selectors'

const featureTypes = ['inception_v3', 'nasnet_large']

const FeatureTypeSelect = ({ setFeatureType, featureType }) => (
	<Select
		filterable={false}
		items={featureTypes}
		itemRenderer={(item, { handleClick, modifiers }) => (
			<MenuItem active={modifiers.active} key={item} text={item} onClick={handleClick} />
		)}
		onItemSelect={value => setFeatureType(value)}
	>
		Feature Type: <Button rightIcon="caret-down" text={featureType} />
	</Select>
)

const mapStateToProps = state => ({
	featureType: getFeatureType(state),
})
const mapDispatchToProps = dispatch => ({
	setFeatureType: value => dispatch(setFeatureType(value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(FeatureTypeSelect)
