import { combineReducers } from 'redux';
import reducer from './reducer';

const createRootReducer = (routerReducer) => combineReducers({
  router: routerReducer,
  reducer,
});

export default createRootReducer;
