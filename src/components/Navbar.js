import { Alignment, Button, Dialog, Menu, MenuItem, Navbar, Popover } from '@blueprintjs/core'
import React from 'react'
import Tabs from '../containers/Tabs'
import Zoom from '../containers/Zoom'
import Stats from '../containers/Stats'
import Settings from '../components/Settings'
import TagSelect from '../containers/TagSelect'
import TagSave from '../containers/TagSave'
import MainMenu from '../components/MainMenu'

class NavbarComponent extends React.Component {
    state = { isOpenLoadTag: false, isOpenSaveTag: false }
    toggleLoadTag = () => this.setState({ isOpenLoadTag: !this.state.isOpenLoadTag })
    toggleSaveTag = () => this.setState({ isOpenSaveTag: !this.state.isOpenSaveTag })

    render() {
        return (
            <Navbar fixedToTop={true}>
                <Dialog
                    icon="document-open"
                    title="Load Tag"
                    isOpen={this.state.isOpenLoadTag}
                    onClose={this.toggleLoadTag}
                >
                    <div className="pt-dialog-body">
                        <TagSelect />
                    </div>
                </Dialog>
                <Dialog
                    icon="floppy-disk"
                    title="Save Tag"
                    isOpen={this.state.isOpenSaveTag}
                    onClose={this.toggleSaveTag}
                >
                    <div className="pt-dialog-body">
                        <TagSave />
                    </div>
                </Dialog>
                <Navbar.Group align={Alignment.LEFT}>
                    <Popover minimal={true} position="bottom">
                        <Button className="pt-minimal" icon="menu" />
                        <Menu>
                            <MenuItem text="Load Tag..." onClick={this.toggleLoadTag} />
                            <MenuItem text="Save Tag..." onClick={this.toggleSaveTag} />
                        </Menu>
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
    }
}

export default NavbarComponent
