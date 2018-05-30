import { Alignment, Button, Navbar } from '@blueprintjs/core'
import * as React from 'react'
import Tabs from '../containers/Tabs'
import Zoom from '../containers/Zoom'
import Stats from '../containers/Stats'
import Settings from '../components/Settings'

const NavbarComponent = () => (
  <Navbar>
    <Navbar.Group align={Alignment.LEFT}>
      <Button className="pt-minimal" icon="menu" />
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

export default NavbarComponent
