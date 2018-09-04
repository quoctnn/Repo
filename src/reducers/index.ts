import { combineReducers } from 'redux'
import debug from './debug';
import settings from './settings';
import profile from './profile';
import auth from './auth';
import groupStore from './groupStore';
import groupListCache from './groupListCache';
import communityStore from './communityStore';
import { profileStore, UserProfile } from './profileStore';
import contactListCache from './contactListCache';
import storageLocal from 'redux-persist/lib/storage'
import { persistReducer, createTransform, PersistConfig } from 'redux-persist';
import { ApiEndpoint } from './debug';
import conversationListCache from './conversationListCache';
import conversationStore from './conversationStore';
import queue from './queue';


const setTransform = createTransform(
  
  (inboundState, key) => {
    console.log("test")
    debugger
    return { ...inboundState};
  },
  (outboundState, key) => {
    debugger
    console.log("test")
    if(window.applicationCache.status === window.applicationCache.UPDATEREADY)
    {
      debugger
      return { debug:outboundState}
    }
    return { ...outboundState}
  },
  { whitelist: [] }
);
const rootPersistConfig:PersistConfig = {
  key: 'root',
  storage: storageLocal,
  blacklist: ['auth'],
  transforms:[setTransform]
}

const rootReducer = combineReducers({
  //debug: persistReducer(debugConfig, debug), 
  settings, profile, auth, profileStore, communityStore, groupStore, groupListCache, contactListCache, debug, conversationListCache, conversationStore, queue
})
export default persistReducer(rootPersistConfig, rootReducer)

export interface RootReducer
{
  settings: any;
      profile: UserProfile;
      auth: any;
      profileStore: { byId:{number:UserProfile}, allIds:number[]};
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