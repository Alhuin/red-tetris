import { combineReducers } from 'redux';
import reducer from './reducer';

const createRootReducer = () => combineReducers({
  reducer,
});

export default createRootReducer;
