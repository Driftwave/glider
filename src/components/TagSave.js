import React from 'react'
import { connect } from 'react-redux'
import { Button, Intent } from '@blueprintjs/core'
import { saveTagData } from '../actionCreators'
import { getUser } from '../selectors'

class TagSave extends React.Component {
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

	render() {
		return (
			<div style={{ textAlign: 'center' }}>
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
		)
	}
}

export default connect(
	state => ({
		user: getUser(state),
	}),
	dispatch => ({
		saveTagData: (tag, user) => dispatch(saveTagData(tag, user)),
	}),
)(TagSave)
