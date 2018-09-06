import { combineReducers } from 'redux'
import { Types } from '../utilities/Types'
export interface PaginatorAction
{
    type?:string
    payload?:{offset:number, results?:any[], total?:number, error:string}
    meta?:{endpoint:string, key:string, itemIdKey:string, pageSize:number}
}
export interface CachePage
{
   totalCount:number
   ids:number[]
   fetching:boolean,
   error:string
}
export const defaultPage = {ids:[], totalCount:0, fetching:false, error:null}
export const createPaginator = (key:string, endpoint:string, itemIdKey:string, pageSize:number) =>
{
    const requestNextPage = ( offset:number):PaginatorAction => ({
      type: Types.REQUEST_PAGE,
      payload: { offset, error:null},
      meta: { endpoint, key, itemIdKey , pageSize }
    })
    const page = (page:CachePage = defaultPage, action:PaginatorAction = {}):CachePage => {
      switch (action.type) {
        case Types.REQUEST_PAGE:
          return { ...page, fetching:true }
        case Types.RECEIVE_PAGE:
          return { ...page, 
            ids: (page.ids || []).concat(action.payload.results.map(item => item[action.meta.itemIdKey])),
            fetching:false,
            totalCount: action.payload.total || page.totalCount,
            error:action.payload.error
          }
        case Types.RESET_PAGED_DATA: 
          return defaultPage
        default:
          return page
      }
    }
    const onlyForEndpoint = (reducer) => (state = {}, action:PaginatorAction = {}) =>
      typeof action.meta == 'undefined' ? action.type == Types.RESET_PAGED_DATA ? reducer(state, action) : state : (action.meta.key == key ? reducer(state, action) : state)
  
    const itemsReducer = (items = {}, action:PaginatorAction = {}) => { 
      switch (action.type) {
        case Types.RECEIVE_PAGE:
          let _items = {}
          for (let item of action.payload.results) {
            _items = {
              ..._items,
              [item[action.meta.itemIdKey]]: item
            }
          }
          return {
            ...items,
            ..._items
          }
        case Types.RESET_PAGED_DATA:
          return {}
        default:
          return items
      }
    }
    return {
      paginationReducer : onlyForEndpoint( page ),
      itemsReducer: onlyForEndpoint(itemsReducer),
      requestNextPage
    }
  }
export interface MultiPaginatorAction
{
    type?:string
    payload?:{pagingId:string,offset:number, results?:any[], total?:number, error:string}
    meta?:{endpoint:(id:string) => string, key:string, itemIdKey:string, pageSize:number}
}
export type PageItem = { [page: string]: CachePage }
export const createMultiPaginator = (key:string, endpoint:(id:string) => string, itemIdKey:string, pageSize:number) =>
{
    const requestNextPage = ( pagingId:string, offset:number):MultiPaginatorAction => ({
      type: Types.REQUEST_PAGE,
      payload: { pagingId, offset, error:null},
      meta: { endpoint, key, itemIdKey , pageSize }
    })
    const pages = (pages:PageItem = {}, action:MultiPaginatorAction = {}) => {
      switch (action.type) {
        case Types.REQUEST_PAGE:
        {
          let p = pages[action.payload.pagingId] || defaultPage
          return {
            ...pages,
            [action.payload.pagingId]: {
              ...p,
              fetching: true
            }
          }
        }
        case Types.RECEIVE_PAGE: 
        {
          let p = pages[action.payload.pagingId] || defaultPage
          return {
            ...pages,
            [action.payload.pagingId]: {
              ...p,
              fetching: false,
              ids:p.ids.concat(action.payload.results.map(item => item[action.meta.itemIdKey])),
              totalCount: action.payload.total || p.totalCount,
              error:action.payload.error
            }
          }
        }
        case Types.RESET_PAGED_DATA: 
          return {}
        default:
          return pages
      }
    }
    const onlyForEndpoint = (reducer) => (state = {}, action:MultiPaginatorAction = {}) =>
      typeof action.meta == 'undefined' ? action.type == Types.RESET_PAGED_DATA ? reducer(state, action) : state : (action.meta.key == key ? reducer(state, action) : state)
  
    const itemsReducer = (items = {}, action:MultiPaginatorAction = {}) => { 
      switch (action.type) {
        case Types.RECEIVE_PAGE:
          let _items = {}
          for (let item of action.payload.results) {  
            _items = {
              ..._items,
              [item[action.meta.itemIdKey]]: item
            }
          }
          return {
            ...items,
            ..._items
          }
        case Types.RESET_PAGED_DATA:
          return {}
        default:
          return items
      }
    }
    return {
      paginationReducer : onlyForEndpoint( pages ),
      itemsReducer: onlyForEndpoint(itemsReducer),
      requestNextPage
    }
  }