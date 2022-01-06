import React from 'react';
import ReactDOM from 'react-dom';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';
import createRootReducer from './store/reducers';
import './index.css';
import App from './App';
import socketMiddleware from './middlewares/socketMiddleware';

// Initialize redux store and apply those middlewares:
// - redux-thunk (to get dispatch inside action creators, see redux/actions/index.js)
// - redux-logger in dev mode
// - custom socketMiddleWare
let middleware = [];
middleware = [...middleware, thunk, socketMiddleware];

const store = createStore(
  createRootReducer(),
  composeWithDevTools(
    applyMiddleware(...middleware),
  ),
);

// Render app inside redux context
ReactDOM.render(
  (
    <Provider store={store}>
      <App />
    </Provider>
  ), document.getElementById('app'),
); // eslint-disable-line no-undef
