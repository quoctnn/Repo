import { combineReducers } from "redux";
import { persistReducer, PersistConfig } from "redux-persist";
import storage from 'redux-persist/lib/storage';
import language from './language';
import { theme } from "./theme";
import endpoint from './endpoint';
import authentication, { AuthenticationData } from "./authentication";
import { embedlyStore } from "../components/general/embedly/redux";
import { EmbedCardItem, Community, UserProfile, Group, Project, Event, Task, Conversation, Favorite } from '../types/intrasocial_types';
import { communityStore } from "./communityStore";
import { profileStore } from './profileStore';
import {groupStore} from './groupStore';
import activeCommunity from './activeCommunity';
import { eventStore } from './eventStore';
import {taskStore} from './taskStore';
import { projectStore } from "./projectStore";
import application from "./application";
import { conversationStore } from './conversationStore';
import messageQueue, { MessageQueue } from "./messageQueue";
import tempCache, { TempCache } from './tempCache';
import { unreadNotifications, UnreadNotifications } from './unreadNotifications';
import { favoriteStore } from './favoriteStore';
const rootPersistConfig:PersistConfig = {
    key: 'root',
    storage: storage,
    blacklist: [    
                    'authentication',
                    "application", 
                    "tempCache",
                    "embedlyStore",
                ],
    debug:true,
  }
const rootReducer = combineReducers({
    authentication, language, theme, endpoint, embedlyStore, communityStore, profileStore,
    groupStore, activeCommunity, eventStore, taskStore, projectStore, application, conversationStore, messageQueue, tempCache, unreadNotifications, favoriteStore
})
export default persistReducer(rootPersistConfig, rootReducer)
export interface ReduxState
{
    language:{language:number}
    theme:{theme:number}
    endpoint: {endpoint: number}
    authentication: AuthenticationData;
    embedlyStore:{byId:{[id:string]:EmbedCardItem}, allIds:string[], queuedIds:{[id:string]:boolean}},
    communityStore:{ byId: { [id: number]: Community},allIds: number[]}
    groupStore:{ byId: { [id: number]: Group},allIds: number[]}
    projectStore:{ byId: { [id: number]: Project},allIds: number[]}
    profileStore:{ byId: { [id: number]: UserProfile},allIds: number[]}
    conversationStore:{ byId: { [id: number]: Conversation},allIds: number[]}
    eventStore:{ byId: { [id: number]: Event},allIds: number[]}
    taskStore:{ byId: { [id: number]: Task},allIds: number[]}
    favoriteStore:{ byId: { [id: number]: Favorite},allIds: number[]}
    activeCommunity:{activeCommunity:number}
    application:{loaded:boolean}
    messageQueue:MessageQueue
    tempCache:TempCache
    unreadNotifications:UnreadNotifications
    _persist:any
}