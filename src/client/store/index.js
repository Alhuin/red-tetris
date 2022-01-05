import React from 'react';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { HistoryRouter as Router } from 'redux-first-history/rr6';
import { createBrowserHistory } from 'history';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createReduxHistoryContext } from 'redux-first-history';
import createRootReducer from './reducers';

function Root({ children, initialState = {} }) {
  const {
    createReduxHistory,
    routerMiddleware,
    routerReducer,
  } = createReduxHistoryContext({ history: createBrowserHistory() });

  const middlewares = [thunk, routerMiddleware];

  const store = createStore(
    createRootReducer(routerReducer),
    initialState,
    composeWithDevTools(
      applyMiddleware(...middlewares),
    ),
  );

  const history = createReduxHistory(store);

  return (
    <Provider store={store}>
      <Router history={history}>{children}</Router>
    </Provider>
  );
}

export default Root;
