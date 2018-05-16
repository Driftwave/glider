import * as React from 'react'
import { connect } from 'react-redux'
import { Tabs, Tab } from '@blueprintjs/core'
import { panelIds } from '../containers/Panels'
import { getActivePanel } from '../selectors'
import { switchPanel } from '../actions'

const TabsComponent = ({ activePanel, switchPanel }) => (
  <Tabs selectedTabId={activePanel} onChange={switchPanel}>
    <span />
    <Tab title={panelIds.UNCERTAIN} id={panelIds.UNCERTAIN} />
    <Tab title={panelIds.POS_PROBS} id={panelIds.POS_PROBS} />
    <Tab title={panelIds.NEG_PROBS} id={panelIds.NEG_PROBS} />
    <span />
    <Tab title={panelIds.POS_LABEL} id={panelIds.POS_LABEL} />
    <Tab title={panelIds.NEG_LABEL} id={panelIds.NEG_LABEL} />
  </Tabs>
)

export default connect(
  state => ({ activePanel: getActivePanel(state) }),
  dispatch => ({ switchPanel: panelId => dispatch(switchPanel(panelId)) }),
)(TabsComponent)
