import { embedlyStore } from './embedlyStore';
import { PageItem } from './createPaginator';
import { combineReducers } from 'redux'
import debug from './debug';
import settings from './settings';
import auth from './auth';
import groupStore from './groupStore';
import groupListCache from './groupListCache';
import communityStore from './communityStore';
import { profileStore } from './profileStore';
import contactListCache from './contactListCache';
import storageLocal from 'redux-persist/lib/storage'
import { persistReducer, PersistConfig } from 'redux-persist';
import { ApiEndpoint } from './debug';
import queue from './queue';
import { conversations } from './conversations';
import { messages } from './messages';
import { statuses } from './statuses';
import { Status, UserProfile, Message, EmbedlyItem, Conversation } from '../types/intrasocial_types';
import { CachePageV2 } from './simplePaginator';


const rootPersistConfig:PersistConfig = {
  key: 'root',
  storage: storageLocal,
  //blacklist: ['auth'],
  debug:true,
} 
const rootReducer = combineReducers({
  //debug: persistReducer(debugConfig, debug), 
  settings, auth, profileStore, communityStore, groupStore, groupListCache, contactListCache, debug,
   queue, conversations, messages, embedlyStore, statuses
})
export default persistReducer(rootPersistConfig, rootReducer)
export interface RootState
{
      settings: any;
      auth:{signedIn:boolean, authToken:string|null, profile:UserProfile|null}
      profileStore: { byId:{[id:number]:UserProfile}, allIds:number[]};
      communityStore: any;
      groupStore: any;
      groupListCache: any;
      contactListCache: any;
      queue:{chatMessages:Message[], statusMessages:Status[]};
      conversations:{pagination:CachePageV2<Conversation>};
      messages:{items:Message[], conversations:PageItem}
      embedlyStore:{byId:{[id:string]:EmbedlyItem}, allIds:string[], queuedIds:{[id:string]:boolean}},
      statuses:{items:{[id:number]:Status}, feed:PageItem}
      debug: {apiEndpoint:number, availableApiEndpoints:ApiEndpoint[] };
  _persist:any
}