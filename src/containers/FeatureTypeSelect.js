import React from 'react'
import { connect } from 'react-redux'
import { Button, MenuItem } from '@blueprintjs/core'
import { Select } from '@blueprintjs/select'
import { setActiveFeatureType } from '../actions'
import { getActiveFeatureType, getFeatureTypes } from '../selectors'

const FeatureTypeSelect = ({ setActiveFeatureType, activeFeatureType, featureTypes }) => (
	<Select
		filterable={false}
		items={featureTypes}
		itemRenderer={(item, { handleClick, modifiers }) => (
			<MenuItem
				active={item === activeFeatureType}
				key={item}
				text={item}
				onClick={handleClick}
			/>
		)}
		onItemSelect={value => setActiveFeatureType(value)}
	>
		Feature Type: <Button rightIcon="caret-down" text={activeFeatureType} />
	</Select>
)

const mapStateToProps = state => ({
	activeFeatureType: getActiveFeatureType(state),
	featureTypes: getFeatureTypes(state),
})
const mapDispatchToProps = dispatch => ({
	setActiveFeatureType: value => dispatch(setActiveFeatureType(value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(FeatureTypeSelect)
