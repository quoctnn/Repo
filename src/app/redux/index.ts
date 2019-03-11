import { combineReducers } from "redux";
import { persistReducer, PersistConfig } from "redux-persist";
import storageLocal from 'redux-persist/lib/storage';
import language from './language';
import { theme } from "./theme";
import endpoint from './endpoint';
import authentication, { AuthenticationData } from "./authentication";
import { embedlyStore } from "../components/general/embedly/redux";
import { EmbedCardItem, Community, UserProfile, Group, Project, Event, Task } from '../types/intrasocial_types';
import { communityStore } from "./communityStore";
import { profileStore } from './profileStore';
import contactListCache from './contactListCache';
import {groupStore} from './groupStore';
import activeCommunity from './activeCommunity';
import { eventStore } from './eventStore';
import {taskStore} from './taskStore';
import { projectStore } from "./projectStore";
const rootPersistConfig:PersistConfig = {
    key: 'root',
    storage: storageLocal,
    blacklist: ['authentication'],
    debug:true,
  }
const rootReducer = combineReducers({
    authentication, language, theme, endpoint, embedlyStore, communityStore, profileStore, contactListCache,
    groupStore, activeCommunity, eventStore, taskStore, projectStore
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
    eventStore:{ byId: { [id: number]: Event},allIds: number[]}
    taskStore:{ byId: { [id: number]: Task},allIds: number[]}
    contactListCache:{contacts:number[]}
    activeCommunity:{activeCommunity:number}
    _persist:any
}