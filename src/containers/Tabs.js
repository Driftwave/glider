import React from 'react'
import { connect } from 'react-redux'
import { Navbar, Tabs, Tab } from '@blueprintjs/core'
import { predictPanelIds, labeledPanelIds, panelNames } from '../containers/Panels'

import { getActivePanelId } from '../selectors'
import { switchPanel } from '../actions'

const TabsComponent = ({ activePanelId, switchPanel }) => (
	<Tabs selectedTabId={activePanelId} onChange={switchPanel}>
		{predictPanelIds.map(id => <Tab title={panelNames[id]} key={id} id={id} />)}
		<Navbar.Divider />
		{labeledPanelIds.map(id => <Tab title={panelNames[id]} key={id} id={id} />)}
	</Tabs>
)

export default connect(
	state => ({ activePanelId: getActivePanelId(state) }),
	dispatch => ({ switchPanel: id => dispatch(switchPanel(id)) }),
)(TabsComponent)
