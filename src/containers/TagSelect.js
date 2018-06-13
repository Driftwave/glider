import React from 'react'
import { connect } from 'react-redux'
import { Button, Intent, Menu, MenuItem } from '@blueprintjs/core'
import { Suggest } from '@blueprintjs/select'
import { fetchTagData } from '../actions'

class TagSelect extends React.Component {
	state = { items: [], selected: null }

	componentDidMount() {
		fetch('/api/tags-metadata')
			.then(response => response.json())
			.then(items => {
				items.forEach(item => (item.text = item.tag + ' (' + item.user + ')'))
				this.setState({ items })
			})
	}

	handleClick = () => {
		const { tag, user } = this.state.selected
		this.props.fetchTagData(tag, user)
	}

	render() {
		return (
			<div style={{ textAlign: 'center' }}>
				<Suggest
					items={this.state.items}
					itemPredicate={(query, item) => item.text.startsWith(query)}
					itemListRenderer={({ items, itemsParentRef, query, renderItem }) => {
						const renderedItems = items.map(renderItem).filter(item => item != null)
						if (renderedItems.length === 0)
							renderedItems.push(<MenuItem disabled={true} text="No results." />)
						return (
							<div style={{ maxHeight: 300, overflow: 'auto' }}>
								<Menu ulRef={itemsParentRef}>{renderedItems}</Menu>
							</div>
						)
					}}
					itemRenderer={(item, { modifiers, handleClick }) =>
						modifiers.matchesPredicate ? (
							<MenuItem
								key={item.text}
								text={item.text}
								label={item.num}
								onClick={handleClick}
							/>
						) : null
					}
					noResults={<MenuItem disabled={true} text="No results." />}
					inputValueRenderer={item => item.text}
					onItemSelect={item => this.setState({ selected: item })}
					popoverProps={{ minimal: true, usePortal: false }}
				>
					<Button text="Select" rightIcon="caret-down" />
				</Suggest>
				<Button
					text="Load"
					intent={Intent.PRIMARY}
					disabled={this.state.selected === null}
					onClick={this.handleClick}
				/>
			</div>
		)
	}
}

export default connect(null, dispatch => ({
	fetchTagData: (tag, user) => dispatch(fetchTagData(tag, user)),
}))(TagSelect)
