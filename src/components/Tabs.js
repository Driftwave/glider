import React from 'react'
import { connect } from 'react-redux'
import { Navbar, Tabs, Tab } from '@blueprintjs/core'
import { predictPanelTypes, labeledPanelTypes, panelNames } from '../constants/panelConstants'

import { getActivePanelType } from '../selectors'
import { switchPanel } from '../actionCreators'

const TabsComponent = ({ activePanelId, switchPanel }) => (
	<Tabs selectedTabId={activePanelId} onChange={switchPanel}>
		{predictPanelTypes.map(id => <Tab title={panelNames[id]} key={id} id={id} />)}
		<Navbar.Divider />
		{labeledPanelTypes.map(id => <Tab title={panelNames[id]} key={id} id={id} />)}
	</Tabs>
)

export default connect(
	state => ({ activePanelType: getActivePanelType(state) }),
	dispatch => ({ switchPanel: panel => dispatch(switchPanel(panel)) }),
)(TabsComponent)
