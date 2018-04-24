import React, { Component } from "react";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "./App.css";
import NavbarComponent from "../components/Navbar";
import Panel from "../containers/Panels";

class App extends Component {
  render() {
    return (
      <div className="App pt-dark">
        <NavbarComponent />
        <Panel />
      </div>
    );
  }
}

export default App;
