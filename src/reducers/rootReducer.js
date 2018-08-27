import { combineReducers } from 'redux';
import plockReducer from './pLockReducer';

export default combineReducers({
    plock: plockReducer
});