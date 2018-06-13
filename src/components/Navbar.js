import { Alignment, Button, Navbar, Popover } from '@blueprintjs/core'
import React from 'react'
import Tabs from './Tabs'
import Zoom from './Zoom'
import Stats from './Stats'
import Settings from './Settings'
import MainMenu from './MainMenu'

export default () => (
    <Navbar fixedToTop={true}>
        <Navbar.Group align={Alignment.LEFT}>
            <Popover minimal={true} position="bottom">
                <Button className="pt-minimal" icon="menu" />
                <MainMenu />
            </Popover>
            <Navbar.Heading>Driftwave Glider</Navbar.Heading>
            <Navbar.Divider />
            <Tabs />
            <Navbar.Divider />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
            <Stats />
            <Zoom />
            <Navbar.Divider />
            <Settings />
        </Navbar.Group>
    </Navbar>
)
