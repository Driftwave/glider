import { applyMiddleware, compose, createStore } from "redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";
import rootReducer from "./reducers";

const configureStore = initialState => {
  const middlewares = [thunk, createLogger()];
  const enhancers = middlewares.map(a => applyMiddleware(a));

  const getComposeFunc = () => {
    if (process.env.NODE_ENV === "development") {
      const { composeWithDevTools } = require("redux-devtools-extension");
      return composeWithDevTools;
    }
    return compose;
  };

  const composeFunc = getComposeFunc();
  const composedEnhancers = composeFunc.apply(null, enhancers);

  return createStore(rootReducer, initialState, composedEnhancers);
};

export default configureStore;
