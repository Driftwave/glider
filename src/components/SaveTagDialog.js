import React from 'react'
import { connect } from 'react-redux'
import { Button, Dialog, Intent } from '@blueprintjs/core'
import { saveTagData, closeDialog } from '../actionCreators'
import { getUser, getActiveDialog } from '../selectors'
import * as dialogTypes from '../constants/dialogTypes'

class SaveTagDialog extends React.Component {
	state = { tag: '' }

	handleClick = () => {
		this.props.saveTagData(this.state.tag, this.props.user)
	}

	handleChange = event => {
		console.log(event)
		const tag = event.target.value.replace(/\W/g, '').toLowerCase()
		this.setState({ tag })
		event.preventDefault()
	}

	render = () => (
		<Dialog
			icon="floppy-disk"
			title="Save Tag"
			isOpen={this.props.isOpen}
			onClose={this.props.closeDialog}
		>
			<div className="pt-dialog-body" style={{ textAlign: 'center' }}>
				<input
					className="pt-input"
					placeholder="Tag name"
					type="text"
					value={this.state.tag}
					onChange={this.handleChange}
				/>
				{` (${this.props.user}) `}
				<Button
					intent={Intent.PRIMARY}
					text="Save"
					disabled={!this.state.tag || this.state.tag.length <= 2}
					onClick={this.handleClick}
				/>
			</div>
		</Dialog>
	)
}

const mapStateToProps = state => ({
	isOpen: getActiveDialog(state) === dialogTypes.SAVE_TAG,
	user: getUser(state),
})

const mapDispatchToProps = dispatch => ({
	closeDialog: () => dispatch(closeDialog(dialogTypes.SAVE_TAG)),
})

export default connect(mapStateToProps, mapDispatchToProps)(SaveTagDialog)
