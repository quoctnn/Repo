import { combineReducers, AnyAction } from 'redux';
import { Types } from '../utilities/Types'
export interface PaginatorAction extends AnyAction
{
    type:string
    payload?:{offset?:number, results?:any[], total?:number, error:string, sorted?:number[]}
    meta?:{endpoint:string, key:string, itemIdKey:string, pageSize:number}
}
export interface CachePage
{
   totalCount:number
   ids:number[]
   fetching:boolean,
   error:string
   last_fetch:number
}
export const getDefaultCachePage = ():CachePage => 
{
  return {ids:[], totalCount:0, fetching:false, error:null, last_fetch:null}
}
export const createPaginator = (key:string, endpoint:string, itemIdKey:string, pageSize?:number) =>
{
    const requestNextPage = ( offset:number):PaginatorAction => ({
      type: Types.REQUEST_PAGE,
      payload: { offset, error:null},
      meta: { endpoint, key, itemIdKey , pageSize }
    })
    const setSortedIds = ( sorted:number[]):PaginatorAction => ({
      type: Types.SET_SORTED_PAGE_IDS,
      payload: { error:null, sorted},
      meta: { endpoint, key, itemIdKey , pageSize }
    })
    
    const page = (page:CachePage = getDefaultCachePage(), action:PaginatorAction):CachePage => {
      switch (action.type) {
        case Types.REQUEST_PAGE:
          return { ...page, fetching:true }
        case Types.RECEIVE_PAGE:
          return { ...page, 
            ids: (page.ids || []).concat(action.payload.results.map(item => item[action.meta.itemIdKey])),
            fetching:false,
            totalCount: action.payload.total || page.totalCount,
            error:action.payload.error,
            last_fetch:Date.now()
          }
          case Types.INSERT_ITEM_TO_PAGE:
          {
            let a = action as InsertItemAction
            let p = { ...page}
            p.ids.unshift(a.item[itemIdKey])
            p.fetching = false
            p.totalCount = p.totalCount + 1
            p.error = null
            return p
          }
          case Types.SET_SORTED_PAGE_IDS:
          {
            let p = { ...page}
            p.ids = action.payload.sorted
            return p
          }
        case Types.RESET_PAGED_DATA: 
          return getDefaultCachePage()
        default:
          return page
      }
    }
    const onlyForEndpoint = (reducer) => (state = {}, action:any) =>
    {
        if((action.meta && action.meta.key == key) || action.type == Types.RESET_PAGED_DATA)
        {
            return reducer(state, action)
        }
        return state
    }
    
  
    const itemsReducer = (items = {}, action:PaginatorAction) => { 
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
        case Types.INSERT_ITEM_TO_PAGE:
        {
          let a = action as InsertItemAction
          return {...items,[a.item[itemIdKey]]: a.item}
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
      requestNextPage,
      setSortedIds
    }
  }
export interface MultiPaginatorAction
{
    type?:string
    payload?:{pagingId:string,offset:number, results?:any[], total?:number, error:string}
    meta?:{endpoint:(id:string) => string, key:string, itemIdKey:string, pageSize:number}
}
export interface InsertItemAction
{
  type?: string
  item?:any
  pagingId?:string
  meta:{key:string}
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
          let p = pages[action.payload.pagingId] || getDefaultCachePage()
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
          let p = pages[action.payload.pagingId] || getDefaultCachePage()
          return {
            ...pages,
            [action.payload.pagingId]: {
              ...p,
              fetching: false,
              ids:p.ids.concat(action.payload.results.map(item => item[action.meta.itemIdKey])),
              totalCount: action.payload.total || p.totalCount,
              error:action.payload.error,
              last_fetch:Date.now()
            }
          }
        }
        case Types.INSERT_ITEM_TO_PAGE:
        {
          let a = action as InsertItemAction
          let p = pages[a.pagingId] || getDefaultCachePage()
          p.ids.unshift(a.item[itemIdKey])
          p.fetching = false
          p.totalCount = p.totalCount + 1
          p.error = null
          return {
            ...pages,
            [a.pagingId]: {
              ...p
            }
          }
        }
        case Types.RESET_PAGED_DATA: 
          return {}
        default:
          return pages
      }
    }
    const onlyForEndpoint = (reducer) => (state = {}, action:any = {}) =>
    {
        if((action.meta && action.meta.key == key) || action.type == Types.RESET_PAGED_DATA)
        {
            return reducer(state, action)
        }
        return state
    }
    const itemsReducer = (items = {}, action:MultiPaginatorAction = {}) => { 
      switch (action.type) {
        case Types.RECEIVE_PAGE:
        {
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
        }
        case Types.RESET_PAGED_DATA:
          return {}
        case Types.INSERT_ITEM_TO_PAGE:
        {
          let a = action as InsertItemAction
          return {...items,[a.item[itemIdKey]]: a.item}
        }
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