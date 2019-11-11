import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from 'redux-persist/lib/storage';
import language from './language';
import { theme } from "./theme";
import endpoint from './endpoint';
import authentication, { AuthenticationData } from "./authentication";
import { embedlyStore } from "../components/general/embedly/redux";
import { EmbedCardItem, Community, UserProfile, Conversation, Favorite, AppLanguage } from '../types/intrasocial_types';
import { communityStore } from "./communityStore";
import { profileStore } from './profileStore';
import activeCommunity from './activeCommunity';
import application, { ApplicationData } from "./application";
import { conversationStore } from './conversationStore';
import messageQueue, { MessageQueue } from "./messageQueue";
import tempCache, { TempCache } from './tempCache';
import { unreadNotifications, UnreadNotifications } from './unreadNotifications';
import { favoriteStore } from './favoriteStore';
const rootPersistConfig = {
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
     activeCommunity,  application, conversationStore, messageQueue, tempCache, unreadNotifications, favoriteStore
})
export default persistReducer(rootPersistConfig, rootReducer)
export enum ReduxKeys{
    language = 0, 
    theme, 
    endpoint,  
    authentication, 
    embedlyStore,
    communityStore,
    profileStore,
    conversationStore,
    favoriteStore,
    activeCommunity,
    application,
    messageQueue,
    tempCache,
    unreadNotifications
}
export interface ReduxState
{
    language:{language:AppLanguage}
    theme:{theme:number}
    endpoint: {endpoint: number}
    authentication: AuthenticationData;
    embedlyStore:{byId:{[id:string]:EmbedCardItem}, allIds:string[], queuedIds:{[id:string]:boolean}},
    communityStore:{ byId: { [id: number]: Community},allIds: number[]}
    profileStore:{ byId: { [id: number]: UserProfile},allIds: number[]}
    conversationStore:{ byId: { [id: number]: Conversation},allIds: number[]}
    favoriteStore:{ byId: { [id: number]: Favorite},allIds: number[]}
    activeCommunity:{activeCommunity:number}
    application:ApplicationData
    messageQueue:MessageQueue
    tempCache:TempCache
    unreadNotifications:UnreadNotifications
    _persist:any
}