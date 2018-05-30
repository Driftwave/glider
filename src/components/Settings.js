import React from 'react'
import { Button, Dialog } from '@blueprintjs/core'
import Thresholds from '../containers/Thresholds'
import FeatureTypeSelect from '../containers/FeatureTypeSelect'

class Settings extends React.Component {
	state = { isOpen: false }

	toggleDisplay = () => this.setState({ isOpen: !this.state.isOpen })

	render() {
		return (
			<div>
				<Button icon="settings" onClick={this.toggleDisplay} />
				<Dialog
					icon="settings"
					isOpen={this.state.isOpen}
					onClose={this.toggleDisplay}
					title="Settings"
				>
					<div className="pt-dialog-body">
						Prediction Thresholds (Negative, Uncertain, Positive):
						<Thresholds />
						<FeatureTypeSelect />
					</div>
				</Dialog>
			</div>
		)
	}
}

export default Settings
