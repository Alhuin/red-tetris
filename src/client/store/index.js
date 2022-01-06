import React from 'react';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { HashRouter as Router } from 'react-router-dom';
import { createHashHistory } from 'history';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createReduxHistoryContext } from 'redux-first-history';
import createRootReducer from './reducers';
import socketMiddleware from '../middlewares/socketMiddleware';

function Root({ children, initialState = {} }) {
  const {
    createReduxHistory,
    routerMiddleware,
    routerReducer,
  } = createReduxHistoryContext({ history: createHashHistory() });

  const middlewares = [thunk, routerMiddleware, socketMiddleware];

  const store = createStore(
    createRootReducer(routerReducer),
    initialState,
    composeWithDevTools(
      applyMiddleware(...middlewares),
    ),
  );

  return (
    <Provider store={store}>
      <Router basename="/" hashType="noslash">{children}</Router>
    </Provider>
  );
}

export default Root;
