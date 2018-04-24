import React, { Component } from "react";
import { Provider } from "react-redux";
import configureStore from "../configureStore";
import App from "../components/App";
import { initApplication } from "../actions";

const store = configureStore();
store.dispatch(initApplication());

export default class Root extends Component {
  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}
