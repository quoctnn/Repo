import { combineReducers } from 'redux';
import { Types } from '../utilities/Types';
import { AjaxRequest } from '../network/AjaxRequest';
import * as Actions from "../actions/Actions"
import Constants from '../utilities/Constants';
export interface EmbedlyMedia
{
    height:number
    width:number
    type:string
    html:string
}
export class EmbedlyItem
{
    url:string
    provider_url:string
    original_url:string
    description:string
    title:string
    thumbnail_url:string
    thumbnail_width:number
    thumbnail_height:number
    media:EmbedlyMedia
    error_code:number
}
const addPages = (state, action) => {
    let pages = action.pages as EmbedlyItem[]
    let newState = {  ...state }
    pages.forEach(p => {
        newState[p.original_url] = p
    })
    return newState
}
export const pagesById = (state = {}, action) =>
{
    switch(action.type) {
        case Types.EMBEDLYSTORE_ADD_PAGES: return addPages(state, action);
        case Types.EMBEDLYSTORE_RESET: return {}
        default : return state;
    }
}
///////////////////////
const addPageIdsToQueue = (state:{}, action) => {

    let pages = action.ids as string[]
    let newState = {...state}
    pages.forEach(p => {
        newState[p] = true
    })
    return newState
}
const removePageIdsFromQueue = (state:{}, action) => {

    let pages = action.ids as string[]
    let newState = {...state}
    pages.forEach(p => {
        delete newState[p]
    })
    return newState
}

const addPageIds = (state:string[], action) => {

    let pages = action.pages as EmbedlyItem[]
    let newState = [...state]
    pages.forEach(p => {
        let id = p.original_url
        newState.push(id)
    })
    return newState
}
export const allPages = (state:string[] = [], action) =>
{
    switch(action.type) {
        case Types.EMBEDLYSTORE_ADD_PAGES: return addPageIds(state, action);
        case Types.EMBEDLYSTORE_RESET: return []
        default : return state;
    }
}
export const pageQueue = (state = {}, action) =>
{
    switch(action.type) {
        case Types.EMBEDLYSTORE_ADD_PAGES_TO_QUEUE: return addPageIdsToQueue(state, action);
        case Types.EMBEDLYSTORE_REMOVE_PAGES_FROM_QUEUE: return removePageIdsFromQueue(state, action);
        case Types.EMBEDLYSTORE_RESET: return {}
        default : return state;
    }
}
​
export const embedlyStore = combineReducers({
    byId : pagesById,
    allIds : allPages,
    queuedIds:pageQueue
});

export const embedlyMiddleware = store => next => action => {
    let state = store.getState().debug
    let result = next(action);
    if (action.type === Types.REQUEST_EMBEDLY_DATA) {
        let ids = action.urls as string[]
        store.dispatch(Actions.embedlyStoreAddPagesToQueue(ids))
        let url = state.availableApiEndpoints[state.apiEndpoint].endpoint +
                  Constants.apiRoute.embedlyApiEndpoint +
                  "?urls=" + ids.map(id => encodeURIComponent( id )).join(",");
        AjaxRequest.get(url,(data:any[], status, request) => {
              let pages = data.map( d => {
                let item = new EmbedlyItem()
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
              store.dispatch(Actions.embedlyStoreAddPages(pages))
              store.dispatch(Actions.embedlyStoreRemovePagesFromQueue(ids))
          },
          (request, status, error) => {
                store.dispatch(Actions.embedlyStoreRemovePagesFromQueue(ids))
          }
        );
    }
    return result;
  };
