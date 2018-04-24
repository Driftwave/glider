import { Alignment, Button, Navbar } from "@blueprintjs/core";
import * as React from "react";
import TabsComponent from "../containers/Tabs";

const NavbarComponent = () => (
  <Navbar>
    <Navbar.Group align={Alignment.LEFT}>
      <Button className="pt-minimal" icon="menu" />
      <Navbar.Heading>Driftwave Glider</Navbar.Heading>
      <Navbar.Divider />
    </Navbar.Group>
    <Navbar.Group>
      <TabsComponent />
    </Navbar.Group>
  </Navbar>
);

export default NavbarComponent;
