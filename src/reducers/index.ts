import { embedlyStore } from './embedlyStore';
import { PageItem } from './createPaginator';
import { combineReducers } from 'redux'
import debug from './debug';
import settings from './settings';
import auth from './auth';
import groupStore from './groupStore';
import groupListCache from './groupListCache';
import eventStore from './eventStore';
import eventListCache from './eventListCache';
import projectStore from './projectStore';
import projectListCache from './projectListCache';
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
import { Status, UserProfile, Message, EmbedlyItem, Conversation, Notification, Group, Community, Project, Task , Event} from '../types/intrasocial_types';
import { CachePageV2 } from './simplePaginator';
import { CachePageV3 } from './simpleMultiPaginator';
import { notifications } from './notifications';
import taskStore from './taskStore';


const rootPersistConfig:PersistConfig = {
  key: 'root',
  storage: storageLocal,
  blacklist: ['auth'],
  debug:true,
}
const rootReducer = combineReducers({
  //debug: persistReducer(debugConfig, debug),
  settings, auth, profileStore, communityStore, groupStore, groupListCache,
  eventStore, eventListCache, projectStore, projectListCache, contactListCache,
   debug, queue, conversations, messages, embedlyStore, statuses, notifications, taskStore
})
export default persistReducer(rootPersistConfig, rootReducer)
export interface RootState
{
      settings: any;
      auth:{signedIn:boolean, authToken:string|null, profile:UserProfile|null}
      profileStore: { byId:{[id:number]:UserProfile}, allIds:number[]};
      communityStore: {communities:Community[]};
      groupStore: {groups:Group[]};
      groupListCache: any;
      eventStore: {events:Event[]};
      eventListCache: any;
      projectStore: {projects:Project[]};
      taskStore: {tasks:Task[]};
      projectListCache: any;
      contactListCache: {contacts:number[]};
      queue:{chatMessages:Message[], statusMessages:Status[]};
      conversations:{pagination:CachePageV2<Conversation>};
      messages:{conversations:CachePageV3<Message>}
      embedlyStore:{byId:{[id:string]:EmbedlyItem}, allIds:string[], queuedIds:{[id:string]:boolean}},
      statuses:{items:{[id:number]:Status}, feed:PageItem}
      debug: {apiEndpoint:number, availableApiEndpoints:ApiEndpoint[] };
      notifications:{pagination:CachePageV2<Notification>}
  _persist:any
}