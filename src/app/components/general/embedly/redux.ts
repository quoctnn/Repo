import { combineReducers } from 'redux';
import { EmbedlyItem } from '../../../types/intrasocial_types';
import { AjaxRequest } from '../../../network/AjaxRequest';
import Constants from '../../../utilities/Constants';
export enum EmbedlyStoreActionTypes {
    AddPages = 'embedly.add_page',
    Reset = 'embedly.reset',
    AddToQueue = 'embedly.add_to_queue',
    RemoveFromQueue = 'embedly.remove_from_queue',
    RequestData = 'embedly.request_data',
}
export interface EmbedlyDataRequestAction{
    type:string
    urls:string[]
}
export interface EmbedlyPagesAction{
    type:string
    pages:EmbedlyItem[]
}
export interface EmbedlyIdsAction{
    type:string
    ids:string[]
}
export const embedlyRequestDataAction = (urls: string[]):EmbedlyDataRequestAction => ({
    type: EmbedlyStoreActionTypes.RequestData,
    urls
})
export const embedlyAddPagesAction = (pages: EmbedlyItem[]):EmbedlyPagesAction => ({
    type: EmbedlyStoreActionTypes.AddPages,
    pages
})
export const embedlyRemovePagesFromQueue = (ids: string[]):EmbedlyIdsAction => ({
    type: EmbedlyStoreActionTypes.RemoveFromQueue,
    ids
})
const addPages = (state, action:EmbedlyPagesAction) => {
    let pages = action.pages
    let newState = {  ...state }
    pages.forEach(p => {
        newState[p.original_url] = p
    })
    return newState
}
export const pagesById = (state = {}, action:EmbedlyPagesAction) =>
{
    switch(action.type) {
        case EmbedlyStoreActionTypes.AddPages: return addPages(state, action);
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
export const allPages = (state:string[] = [], action:EmbedlyPagesAction) =>
{
    switch(action.type) {
        case EmbedlyStoreActionTypes.AddPages: return addPageIds(state, action);
        case EmbedlyStoreActionTypes.Reset: return []
        default : return state;
    }
}
export const pageQueue = (state = {}, action:EmbedlyIdsAction) =>
{
    switch(action.type) {
        case EmbedlyStoreActionTypes.AddToQueue: return addPageIdsToQueue(state, action);
        case EmbedlyStoreActionTypes.RemoveFromQueue: return removePageIdsFromQueue(state, action);
        case EmbedlyStoreActionTypes.Reset: return {}
        default : return state;
    }
}
​
export const embedlyStore = combineReducers({
    byId : pagesById,
    allIds : allPages,
    queuedIds:pageQueue
});

export const embedlyMiddleware = store => next => (action:EmbedlyDataRequestAction) => {
    let state = store.getState().debug
    let result = next(action);
    if (action.type === EmbedlyStoreActionTypes.RequestData) {
        let ids = action.urls
        store.dispatch(embedlyRequestDataAction(ids))
        let url = state.availableApiEndpoints[state.apiEndpoint].endpoint +
                  Constants.apiRoute.embedlyApiEndpoint +
                  "?urls=" + ids.map(id => encodeURIComponent( id )).join(",");
        AjaxRequest.get(url,(data:any[], status, request) => {
              let pages = data.map( d => {
                let item = {} as EmbedlyItem
                item.provider_url = d.provider_url
                item.description = d.description
                item.title = d.title
                item.url = d.url
                item.original_url = d.original_url
                item.media = d.media
                item.error_code = d.error_code
                if(d.images && d.images.length > 0)
                {
                    let img = d.images[0]
                    item.thumbnail_url = img.url
                    item.thumbnail_width = img.width
                    item.thumbnail_height = img.height
                }
                return item
              })
              store.dispatch(embedlyAddPagesAction(pages))
              store.dispatch(embedlyRemovePagesFromQueue(ids))
          },
          (request, status, error) => {
                store.dispatch(embedlyRemovePagesFromQueue(ids))
          }
        );
    }
    return result;
  };
