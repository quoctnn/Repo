import { combineReducers } from 'redux'
import debug from './debug';
import settings from './settings';
const appReducers = combineReducers({
  debug, settings
})
export default appReducers
