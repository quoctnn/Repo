import { combineReducers } from 'redux'
import debug from './debug';
import settings from './settings';
import profile from './profile';
import contacts from './contacts';
import auth from './auth';
import communities from './communities';

const appReducers = combineReducers({
  debug, settings, profile, contacts, auth, communities
})
export default appReducers
