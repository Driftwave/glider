import React from 'react'
import { connect } from 'react-redux'
import { Menu, MenuItem } from '@blueprintjs/core'
import { openDialog } from '../actionCreators'
import * as dialogTypes from '../constants/dialogTypes'

const MainMenu = ({ openLoadTagDialog, openSaveTagDialog }) => (
	<Menu>
		<MenuItem text="Load Tag..." onClick={openLoadTagDialog} />
		<MenuItem text="Save Tag..." onClick={openSaveTagDialog} />
	</Menu>
)

const mapDispatchToProps = dispatch => ({
	openLoadTagDialog: () => dispatch(openDialog(dialogTypes.LOAD_TAGS)),
	openSaveTagDialog: () => dispatch(openDialog(dialogTypes.SAVE_TAGS)),
})

export default connect(null, mapDispatchToProps)(MainMenu)
