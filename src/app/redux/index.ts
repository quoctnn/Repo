import { combineReducers } from "redux";
import { persistReducer, PersistConfig } from "redux-persist";
import storage from 'redux-persist/lib/storage';
import language from './language';
import { theme } from "./theme";
import endpoint from './endpoint';
import authentication, { AuthenticationData } from "./authentication";
import { embedlyStore } from "../components/general/embedly/redux";
import { EmbedCardItem, Community, UserProfile, Group, Project, Event, Task } from '../types/intrasocial_types';
import { communityStore } from "./communityStore";
import { profileStore } from './profileStore';
import {groupStore} from './groupStore';
import activeCommunity from './activeCommunity';
import { eventStore } from './eventStore';
import {taskStore} from './taskStore';
import { projectStore } from "./projectStore";
import application from "./application";
import resolvedContext, { ResolvedContext } from "./resolvedContext";
const rootPersistConfig:PersistConfig = {
    key: 'root',
    storage: storage,
    blacklist: ['authentication', "application"],
    debug:true,
  }
const rootReducer = combineReducers({
    authentication, language, theme, endpoint, embedlyStore, communityStore, profileStore,
    groupStore, activeCommunity, eventStore, taskStore, projectStore, application, resolvedContext,
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
    activeCommunity:{activeCommunity:number}
    application:{loaded:boolean}
    resolvedContext:ResolvedContext
    _persist:any
}