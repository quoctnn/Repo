import { combineReducers } from 'redux'
import debug from './debug';
import settings from './settings';
import profile from './profile';
import auth from './auth';
import groupStore from './groupStore';
import groupListCache from './groupListCache';
import communityStore from './communityStore';
import profileStore from './profileStore';
import contactListCache from './contactListCache';

const appReducers = combineReducers({
  debug, settings, profile, auth, profileStore, communityStore, groupStore, groupListCache, contactListCache
})
export default appReducers
