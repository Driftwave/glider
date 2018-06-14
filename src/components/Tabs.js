import React from 'react'
import { connect } from 'react-redux'
import { Navbar, Tabs, Tab } from '@blueprintjs/core'
import { predictPanelTypes, labeledPanelTypes, panelNames } from '../constants/panelConstants'

import { getActivePanel } from '../selectors'
import { switchPanel } from '../actionCreators'

const TabsComponent = ({ active, switchPanel }) => (
	<Tabs selectedTabId={active} onChange={switchPanel}>
		{predictPanelTypes.map(pt => <Tab title={panelNames[pt]} key={pt} id={pt} />)}
		<Navbar.Divider />
		{labeledPanelTypes.map(pt => <Tab title={panelNames[pt]} key={pt} id={pt} />)}
	</Tabs>
)

export default connect(
	state => ({ active: getActivePanel(state) }),
	dispatch => ({ switchPanel: panel => dispatch(switchPanel(panel)) }),
)(TabsComponent)
