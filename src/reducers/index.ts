import { combineReducers } from 'redux'
import debug from './debug';
import settings from './settings';
import profile from './profile';

const appReducers = combineReducers({
  debug, settings, profile
})
export default appReducers
