import { combineReducers } from 'redux';
import { EmbedCardItem } from '../../../types/intrasocial_types';
import { LinkCardType } from './Embedly';
import {ApiClient} from '../../../network/ApiClient';
import { PersistConfig, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
export enum EmbedlyStoreActionTypes {
    AddPages = 'embedly.add_page',
    Reset = 'embedly.reset',
    AddToQueue = 'embedly.add_to_queue',
    RemoveFromQueue = 'embedly.remove_from_queue',
    RequestData = 'embedly.request_data',
}
export interface EmbedlyAction{
    type:EmbedlyStoreActionTypes
}
export interface EmbedlyDataRequestAction extends EmbedlyAction{
    urls:string[],
    cardType:LinkCardType
}
export interface EmbedlyPagesAction extends EmbedlyAction{
    pages:EmbedCardItem[]
}
export interface EmbedlyIdsAction extends EmbedlyAction {
    ids:string[]
}
export const embedlyRequestDataAction = (urls: string[], cardType:LinkCardType):EmbedlyDataRequestAction => ({
    type: EmbedlyStoreActionTypes.RequestData,
    urls,
    cardType
})
export const embedlyAddPagesAction = (pages: EmbedCardItem[]):EmbedlyPagesAction => ({
    type: EmbedlyStoreActionTypes.AddPages,
    pages
})
export const embedlyAddPagesToQueue = (ids: string[]):EmbedlyIdsAction => ({
    type: EmbedlyStoreActionTypes.AddToQueue,
    ids
})
export const embedlyRemovePagesFromQueue = (ids: string[]):EmbedlyIdsAction => ({
    type: EmbedlyStoreActionTypes.RemoveFromQueue,
    ids
})
export const resetEmbedlyStoreAction = ():EmbedlyAction => ({
    type: EmbedlyStoreActionTypes.Reset,
})
const addPages = (state, action:EmbedlyPagesAction) => {
    let pages = action.pages
    let newState = {  ...state }
    pages.forEach(p => {
        newState[p.original_url] = p
    })
    return newState
}
export const pagesById = (state = {}, action:EmbedlyPagesAction | EmbedlyAction) =>
{
    switch(action.type) {
        case EmbedlyStoreActionTypes.AddPages: return addPages(state, action as EmbedlyPagesAction);
        case EmbedlyStoreActionTypes.Reset: return {}
        default : return state;
    }
}
const addPageIdsToQueue = (state:{}, action:EmbedlyIdsAction) => {

    let pages = action.ids
    let newState = {...state}
    pages.forEach(p => {
        newState[p] = true
    })
    return newState
}
const removePageIdsFromQueue = (state:{}, action:EmbedlyIdsAction) => {

    let pages = action.ids
    let newState = {...state}
    pages.forEach(p => {
        delete newState[p]
    })
    return newState
}
const addPageIds = (state:string[], action:EmbedlyPagesAction) => {

    let pages = action.pages
    let newState = [...state]
    pages.forEach(p => {
        let id = p.original_url
        newState.push(id)
    })
    return newState
}
export const allPages = (state:string[] = [], action:EmbedlyPagesAction | EmbedlyAction) =>
{
    switch(action.type) {
        case EmbedlyStoreActionTypes.AddPages: return addPageIds(state, action as EmbedlyPagesAction);
        case EmbedlyStoreActionTypes.Reset: return []
        default : return state;
    }
}
export const pageQueue = (state = {}, action:EmbedlyIdsAction | EmbedlyAction) =>
{
    switch(action.type) {
        case EmbedlyStoreActionTypes.AddToQueue: return addPageIdsToQueue(state, action as EmbedlyIdsAction);
        case EmbedlyStoreActionTypes.RemoveFromQueue: return removePageIdsFromQueue(state, action as EmbedlyIdsAction);
        case EmbedlyStoreActionTypes.Reset: return {}
        default : return state;
    }
}
​
const embedStore = combineReducers({
    byId : pagesById,
    allIds : allPages,
    queuedIds:pageQueue
});
const rootPersistConfig:PersistConfig = {
    key: 'embedlyStore',
    storage: storage,
    blacklist: [    
                    'queuedIds',
                ],
    debug:true,
  }
export const embedlyStore =  persistReducer(rootPersistConfig, embedStore)
const requestEmbedlyCards = (store, action:EmbedlyDataRequestAction) => {

    let ids = action.urls
    ApiClient.getEmbedCards(ids, (data, status, error) => {

        if(data && !error)
            store.dispatch(embedlyAddPagesAction(data))
        store.dispatch(embedlyRemovePagesFromQueue(ids))
    })
}
//MIDDLEWARE
export const embedlyMiddleware = store => next => (action:EmbedlyDataRequestAction) => {
    let result = next(action)
    if (action.type === EmbedlyStoreActionTypes.RequestData) {
        let ids = action.urls
        store.dispatch(embedlyAddPagesToQueue(ids))
        switch(action.cardType)
        {
            case LinkCardType.embed: requestEmbedlyCards(store, action);break;
            default:break;
        }
    }
    return result;
  };
