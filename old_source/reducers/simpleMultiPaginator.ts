import { Types } from "../utilities/Types";
import { ItemStorage } from './simplePaginator';
import { InsertItemAction, MultiPaginatorAction } from "./createPaginator";

export interface CachePageV3<T>
{
   totalCount:number|undefined|null
   ids:number[]
   fetching:boolean,
   error:string|null
   last_fetch:number|null
   position:number
   items:ItemStorage<T>
   dirty:boolean
   id:string
}
export const getDefaultCachePageV3 = <T>():CachePageV3<T> => 
{
  return {ids:[], totalCount:0, fetching:false, error:null, last_fetch:null, position:0, items:{}, dirty:true, id:"0"}
}
export type PageItemV3<T> = { [page: string]: CachePageV3<T> }

export const simpleMultiPaginator = <T>(key:string, endpoint:(id:string) => string, itemIdKey:string, pageSize:number, sortItemKey:string, sortAscending:boolean) =>
{
    const requestNextPage = ( pagingId:string, offset:number):MultiPaginatorAction => ({
      type: Types.REQUEST_PAGE,
      payload: { pagingId, offset, error:null},
      meta: { endpoint, key, itemIdKey , pageSize }
    })
    const setNotFetching = ( pagingId:string):MultiPaginatorAction => ({
      type: Types.REQUEST_PAGE,
      payload: { pagingId, error:null},
      meta: { endpoint, key, itemIdKey , pageSize }
    })
    const sortObjects = (objects:ItemStorage<T>, sortItemKey:string, sortAscending:boolean) => {
        return Object.keys(objects).map(k => objects[parseInt(k)]).sort((a:any,b:any) => sortAscending ?  (a[sortItemKey] as string).localeCompare(b[sortItemKey]) : (b[sortItemKey] as string).localeCompare(a[sortItemKey])).map((i:any) => i[itemIdKey])
    }
    const pages = (pages:PageItemV3<T> = {}, action:MultiPaginatorAction = {}) => {
      switch (action.type) 
      {
        case Types.SET_NOT_FETCHING: 
        {
          let p = pages[action.payload!.pagingId] || getDefaultCachePageV3()
          return {
            ...pages,
            [action.payload!.pagingId]: {
              ...p,
              fetching: false
            }
          }
        }
        case Types.REQUEST_PAGE:
        {
          let p = pages[action.payload!.pagingId] || getDefaultCachePageV3()
          return {
            ...pages,
            [action.payload!.pagingId]: {
              ...p,
              fetching: true
            }
          }
        }
        case Types.RECEIVE_PAGE: 
        {
            let _items:ItemStorage<T> = {}
            for (let item of action.payload!.results!) {  
                _items = {
                ..._items,
                [item[action.meta!.itemIdKey]]: item
                }
            }
            const page = pages[action.payload!.pagingId] || getDefaultCachePageV3()
            const clearContent = page.dirty && action.payload.offset == 0
            const prevItems = clearContent ? [] : page.items
            const prevPos = clearContent ? 0 : page.position
            const newItems = { ...prevItems, ..._items }
            const itemsArray = sortObjects(newItems, sortItemKey, sortAscending)
            const position = prevPos + action.payload!.results!.length
            page.items = newItems
            page.dirty = false
            page.fetching = false
            page.ids = itemsArray
            page.totalCount = action.payload!.total || page.totalCount
            page.error = action.payload!.error
            page.position = position
            page.last_fetch = Date.now()
            page.id = action.payload!.pagingId
            return {
            ...pages,
            [action.payload!.pagingId]: {
              ...page
            }
          }
        }
        case Types.INSERT_ITEM_TO_PAGE:
        {
            let a = action as InsertItemAction
            let page = pages[a.pagingId!] || getDefaultCachePageV3()
            const newId = a.item[itemIdKey]
            const newItems = {...page.items,[newId]: a.item}

            let didExist = page.ids.findIndex(id => id == newId) != -1
            page.ids = page.ids.filter(id => id != newId)
            page.ids.unshift(newId)
            page.fetching = false
            page.items = newItems
            if(a.isNew && !didExist)
                page.totalCount = !!page.totalCount ? page.totalCount + 1 : 1
            page.error = null
            return {
            ...pages,
            [a.pagingId!]: {
              ...page
            }
          }
        }
        case Types.SET_DIRTY:
        {
            const pgs = Object.keys( pages ).map(k => {const o = pages[k];o.dirty = true;return o})
            var result:PageItemV3<T> = pgs.reduce(function(map, obj) {
                map[obj.id] = obj
                return map
            }, {});

          return {...result}
        }
        case Types.RESET_PAGED_DATA: 
          return {}
        default:
          return pages
      }
    }
    const onlyForEndpoint = (reducer:any) => (state = {}, action:any = {}) =>
    {
        if((action.meta && action.meta.key == key) || action.type == Types.RESET_PAGED_DATA || action.type == Types.SET_DIRTY)
        {
            return reducer(state, action)
        }
        return state
    }
    return {
      paginationReducer : onlyForEndpoint( pages ),
      requestNextPage,
      setNotFetching,
    }
  }