import { embedlyStore, EmbedlyItem } from './embedlyStore';
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
import queue from './queue';
import { conversations } from './conversations';
import { Conversation, Message } from './conversations';
import { messages } from './messages';


const rootPersistConfig:PersistConfig = {
  key: 'root',
  storage: storageLocal,
  blacklist: ['auth'],
  debug:true,
} 

const rootReducer = combineReducers({
  //debug: persistReducer(debugConfig, debug), 
  settings, profile, auth, profileStore, communityStore, groupStore, groupListCache, contactListCache, debug,
   conversationListCache, queue, conversations, messages, embedlyStore
})
export default persistReducer(rootPersistConfig, rootReducer)
export interface RootReducer
{
  settings: any;
      profile: UserProfile;
      auth: any;
      profileStore: { byId:{[id:number]:UserProfile}, allIds:number[]};
      communityStore: any;
      groupStore: any;
      groupListCache: any;
      contactListCache: any;
      conversationListCache:any;
      queue:{chatMessages:Message[]};
      conversations:{items:Conversation[], pagination:CachePage};
      messages:{items:Message[], conversations:PageItem}
      embedlyStore:{byId:{[id:string]:EmbedlyItem}, allIds:string[], queuedIds:string[]}
    debug: {accessToken:string, apiEndpoint:number, availableApiEndpoints:ApiEndpoint[] };
  _persist:any
}