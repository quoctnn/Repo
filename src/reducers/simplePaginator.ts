import { InsertItemAction } from "./createPaginator";
import { AnyAction } from "redux";
import { Types } from "../utilities/Types";
export type ItemStorage<T> = {[id:number]:T}
export interface CachePageV2<T>
{
   totalCount:number|undefined|null
   ids:number[]
   fetching:boolean,
   error:string|null
   last_fetch:number|null
   position:number
   items:ItemStorage<T>
   dirty:boolean
}
export const getDefaultCachePageV2 = <T>():CachePageV2<T> => 
{
  return {ids:[], totalCount:0, fetching:false, error:null, last_fetch:null, position:0, items:{}, dirty:true}
}
export interface PaginatorActionV2 extends AnyAction
{
    type:string
    payload?:{offset?:number, results?:any[], total?:number, error:string|null}
    meta?:{endpoint:string, key:string, pageSize:number|undefined}
}
export const simplePaginator = <T>(key:string, endpoint:string, itemIdKey:string, sortItemKey:string, sortAscending:boolean, pageSize?:number  ) =>
{
    const requestNextPage = ( offset:number):PaginatorActionV2 => ({
      type: Types.REQUEST_PAGE,
      payload: { offset, error:null},
      meta: { endpoint, key , pageSize }
    })
    const setNotFetching = ():PaginatorActionV2 => ({
      type: Types.SET_NOT_FETCHING,
      payload: { error:null},
      meta: { endpoint, key , pageSize }
    })
    const sortObjects = (objects:ItemStorage<T>, sortItemKey:string, sortAscending:boolean) => {
        return Object.keys(objects).map(k => objects[parseInt(k)]).sort((a:any,b:any) => sortAscending ?  (a[sortItemKey] as string).localeCompare(b[sortItemKey]) : (b[sortItemKey] as string).localeCompare(a[sortItemKey])).map((i:any) => i[itemIdKey])
    }
    const page = (page:CachePageV2<T> = getDefaultCachePageV2(), action:PaginatorActionV2):CachePageV2<T> => {
      switch (action.type) 
      {
        case Types.SET_NOT_FETCHING: 
          return { ...page, fetching:false }
        case Types.REQUEST_PAGE:
          return { ...page, fetching:true }
        case Types.RECEIVE_PAGE:
        {
          let _items:ItemStorage<T> = {}
          for (let item of action.payload!.results!) {
            _items = {
              ..._items,
              [item[itemIdKey]]: item
            }
          }
          const newItems = { ...page.items, ..._items }
          const itemsArray = sortObjects(newItems, sortItemKey, sortAscending)
          const position = page.position + action.payload!.results!.length
          return { ...page, 
            ids: itemsArray,
            fetching:false,
            totalCount: action.payload!.total || page.totalCount,
            error:action.payload!.error,
            last_fetch:Date.now(),
            items:newItems,
            position:position,
            dirty:false
          }
        }
        case Types.INSERT_ITEM_TO_PAGE:
        {
            let a = action as InsertItemAction
            const newItems = {...page.items,[a.item[itemIdKey]]: a.item}
            let p = { ...page}
            let newId = a.item[itemIdKey]
            let didExist = p.ids.findIndex(id => id == newId) != -1

            p.ids = p.ids.map(id => id).filter(id => id != newId)
            p.ids.unshift(newId)
            p.fetching = false
            if(a.isNew && !didExist)
            {
                p.totalCount = !!p.totalCount ? p.totalCount + 1 : 1
            }
            p.error = null
            p.items = newItems
            return p
        }
        case Types.SET_DIRTY:return { ...page, dirty:true }
        
        case Types.RESET_PAGED_DATA:  return getDefaultCachePageV2()
        default: return page
      }
    }
    const onlyForEndpoint = (reducer:any) => (state = {}, action:any) =>
    {
        if((action.meta && action.meta.key == key) || action.type == Types.RESET_PAGED_DATA)
        {
            return reducer(state, action)
        }
        return state
    }
    return {
      paginationReducer : onlyForEndpoint( page ),
      requestNextPage,
      setNotFetching,
    }
  }