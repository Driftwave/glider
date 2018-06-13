import React, { Component } from 'react'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import './App.css'
import NavbarComponent from '../components/Navbar'
import MainPanel from './MainPanel'
import LoadTagsDialog from './LoadTagsDialog'
// import STagDialog from './LoadTagDialog'

class App extends Component {
	render() {
		return (
			<div className="App pt-dark">
				<LoadTagsDialog />
				<NavbarComponent />
				<MainPanel />
			</div>
		)
	}
}

export default App
