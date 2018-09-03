import { combineReducers, Reducer } from 'redux'
import debug from './debug';
import settings from './settings';
import profile from './profile';
import auth from './auth';
import groupStore from './groupStore';
import groupListCache from './groupListCache';
import communityStore from './communityStore';
import profileStore from './profileStore';
import contactListCache from './contactListCache';
import storageSession from 'redux-persist/lib/storage/session'
import storageLocal from 'redux-persist/lib/storage'
import { persistReducer, PersistConfig } from 'redux-persist'
import { ApiEndpoint } from './debug';
import conversationListCache from './conversationListCache';
import conversationStore from './conversationStore';
import queue from './queue';

const rootPersistConfig = {
  key: 'root',
  storage: storageLocal,
  blacklist: ['auth']
}

const debugConfig = {
  key: 'debug',
  storage: storageSession,
}

const rootReducer = combineReducers({
  //debug: persistReducer(debugConfig, debug),
  settings, profile, auth, profileStore, communityStore, groupStore, groupListCache, contactListCache, debug, conversationListCache, conversationStore, queue
})

export default persistReducer(rootPersistConfig, rootReducer)

export interface RootReducer
{
  settings: any;
      profile: any;
      auth: any;
      profileStore: any;
      communityStore: any;
      groupStore: any;
      groupListCache: any;
      contactListCache: any;
      conversationListCache:any;
      conversationStore:any;
      queue:any;
  debug: {accessToken:string, apiEndpoint:number, availableApiEndpoints:ApiEndpoint[] };
  _persist:any
}