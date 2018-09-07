import { PageItem, CachePage } from './createPaginator';
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
import { persistReducer, PersistConfig } from 'redux-persist';
import { ApiEndpoint } from './debug';
import conversationListCache from './conversationListCache';
import conversationStore from './conversationStore';
import queue from './queue';
import { conversations } from './conversations';
import { Conversation, Message } from './conversationStore';
import { messages } from './messages';


const rootPersistConfig:PersistConfig = {
  key: 'root',
  storage: storageLocal,
  blacklist: ['auth'],
  debug:true,
  /* stateReconciler:(inboundState, originalState, 
    reducedState) => 
  {
    console.log("window.applicationCache.status", window.applicationCache.status)
    if(window.applicationCache.status === window.applicationCache.UPDATEREADY)
    {
        return {...originalState, debug:inboundState.debug }
    }
    return  { ...inboundState, debug:inboundState.debug, auth:originalState.auth } 
  } */
} 

const rootReducer = combineReducers({
  //debug: persistReducer(debugConfig, debug), 
  settings, profile, auth, profileStore, communityStore, groupStore, groupListCache, contactListCache, debug, conversationListCache, conversationStore, queue, conversations, messages
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
      queue:{chatMessages:Message[]};
      conversations:{items:Conversation[], pagination:CachePage};
      messages:{items:Message[], conversations:PageItem}
  debug: {accessToken:string, apiEndpoint:number, availableApiEndpoints:ApiEndpoint[] };
  _persist:any
}