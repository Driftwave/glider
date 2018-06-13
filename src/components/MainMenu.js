import React from 'react'
import { Dialog, Menu, MenuItem } from '@blueprintjs/core'

const MainMenu = ({ isOpenLoadTag, isOpenSaveTag, toggleLoadTag, toggleSaveTag }) => (
	<Menu>
		<MenuItem text="Load Tag..." onClick={toggleLoadTag} />
		<Dialog
			icon="document-open"
			title="Load Tag"
			isOpen={isOpenLoadTag}
			onClose={toggleLoadTag}
		/>
		<MenuItem text="Save Tag..." onClick={toggleSaveTag} />
		<Dialog
			icon="floppy-disk"
			title="Save Tag"
			isOpen={isOpenSaveTag}
			onClose={toggleSaveTag}
		/>
	</Menu>
)

export default MainMenu
