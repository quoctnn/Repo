import { AnyAction } from 'redux'
import { Types } from '../utilities/Types';
import { Status } from '../types/intrasocial_types';
export interface PaginatorAction extends AnyAction
{
    type:string
    payload?:{offset?:number, results?:any[], total?:number, error:string|null, sorted?:number[]}
    meta?:{endpoint:string, key:string, itemIdKey:string, pageSize:number|undefined}
}
export interface CachePage
{
   totalCount:number|undefined|null
   ids:number[]
   fetching:boolean,
   error:string|null
   last_fetch:number|null
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
    const setNotFetching = ():PaginatorAction => ({
      type: Types.SET_NOT_FETCHING,
      payload: { error:null},
      meta: { endpoint, key, itemIdKey , pageSize }
    })
    const setSortedIds = ( sorted:number[]):PaginatorAction => ({
      type: Types.SET_SORTED_PAGE_IDS,
      payload: { error:null, sorted},
      meta: { endpoint, key, itemIdKey , pageSize }
    })
    
    const page = (page:CachePage = getDefaultCachePage(), action:PaginatorAction):CachePage => {
      switch (action.type) 
      {
        case Types.SET_NOT_FETCHING: 
          return { ...page, fetching:false }
        case Types.REQUEST_PAGE:
          return { ...page, fetching:true }
        case Types.RECEIVE_PAGE:
        {
          const receivedIds = action.payload!.results!.map(item => item[action.meta!.itemIdKey])
          return { ...page, 
            ids: (page.ids || []).concat(receivedIds).distinct(),
            fetching:false,
            totalCount: action.payload!.total || page.totalCount,
            error:action.payload!.error,
            last_fetch:Date.now()
          }
        }
          case Types.INSERT_ITEM_TO_PAGE:
          {
            let a = action as InsertItemAction
            let p = { ...page}
            let newId = a.item[itemIdKey]
            let didExist = p.ids.findIndex(id => id == newId) != -1
            p.ids = p.ids.map(id => id).filter(id => id != newId)
            p.ids.unshift(newId)
            p.fetching = false
            if(a.isNew && !didExist)
              p.totalCount = !!p.totalCount ? p.totalCount + 1 : 1
            p.error = null
            return p
          }
          case Types.SET_SORTED_PAGE_IDS:
          {
            let p = { ...page}
            p.ids = action.payload!.sorted || []
            return p
          }
        case Types.RESET_PAGED_DATA: 
          return getDefaultCachePage()
        default:
          return page
           
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
    
  
    const itemsReducer = (items = {}, action:PaginatorAction) => { 
      switch (action.type) {
        case Types.RECEIVE_PAGE:
          let _items = {}
          for (let item of action.payload!.results!) {
            _items = {
              ..._items,
              [item[action.meta!.itemIdKey]]: item
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
    const socketDataReducer = (items = {}, action:PaginatorAction) => { 
      switch (action.type) {
        case Types.RECEIVE_PAGE:
          let _items = {}
          for (let item of action.payload!.results!) {
            _items = {
              ..._items,
              [item[action.meta!.itemIdKey]]: item
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
      socketDataReducer:onlyForEndpoint(socketDataReducer),
      requestNextPage,
      setNotFetching,
      setSortedIds
    }
  }
export interface MultiPaginatorAction
{
    type?:string
    payload?:{pagingId:string,offset?:number, results?:any[], total?:number, error:string|null}
    meta?:{endpoint:(id:string) => string, key:string, itemIdKey:string, pageSize:number}
}
export interface InsertItemAction
{
  type?: string
  item?:any
  pagingId?:string
  isNew?:boolean
  meta:{key:string, itemIdKey?:string}
}
export interface ItemMentionAction
{
  type?: string
  item?:any
  meta:{key:string, itemIdKey?:string}
  reactions?:{ [id: string]: number[] }
  reaction_count?:number
}
export type PageItem = { [page: string]: CachePage }
export const createMultiPaginator = (key:string, endpoint:(id:string) => string, itemIdKey:string, pageSize:number) =>
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
    const pages = (pages:PageItem = {}, action:MultiPaginatorAction = {}) => {
      switch (action.type) 
      {
        case Types.SET_NOT_FETCHING: 
        {
          let p = pages[action.payload!.pagingId] || getDefaultCachePage()
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
          let p = pages[action.payload!.pagingId] || getDefaultCachePage()
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
          let p = pages[action.payload!.pagingId] || getDefaultCachePage()
          return {
            ...pages,
            [action.payload!.pagingId]: {
              ...p,
              fetching: false,
              ids:p.ids.concat(action.payload!.results!.map(item => item[action.meta!.itemIdKey])).distinct(),
              totalCount: action.payload!.total || p.totalCount,
              error:action.payload!.error,
              last_fetch:Date.now()
            }
          }
        }
        case Types.INSERT_ITEM_TO_PAGE:
        {
          let a = action as InsertItemAction
          let p = pages[a.pagingId!] || getDefaultCachePage()
          let newId = a.item[itemIdKey]
          let didExist = p.ids.findIndex(id => id == newId) != -1
          p.ids = p.ids.filter(id => id != newId)
          p.ids.unshift(newId)
          p.fetching = false
          if(a.isNew && !didExist)
            p.totalCount = !!p.totalCount ? p.totalCount + 1 : 1
          p.error = null
          return {
            ...pages,
            [a.pagingId!]: {
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
    const onlyForEndpoint = (reducer:any) => (state = {}, action:any = {}) =>
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
          for (let item of action.payload!.results!) {  
            _items = {
              ..._items,
              [item[action.meta!.itemIdKey]]: item
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
      requestNextPage,
      setNotFetching,
    }
  }


  //////////////
export const statusMultiPaginator = (key:string, endpoint:(id:string) => string, itemIdKey:string, pageSize:number) =>
{
  /*
    key:{
      feed:
      {
        feedKey:{
            totalCount:number
            last_fetch:number
            ids:[number]
            fetching:boolean
            error:string
        }
      }
      items:{[id:number]:Status}
    }
    */
    const flattenList = (statusList:Status[]):Status[] => 
    {
      return statusList.reduce<Status[]>((flat, i) => {
        if (i.children && i.children.length > 0) 
        {
          let children = i.children
          i.children_ids = children.map(i => i.id)
          i.children = []
          return flat.concat(flattenList(children)).concat(i)
        }
        return flat.concat(i)
      }, []);
    }
    const requestNextStatusPage = ( pagingId:string, offset:number):MultiPaginatorAction => ({
      type: Types.REQUEST_PAGE,
      payload: { pagingId, offset, error:null},
      meta: { endpoint, key, itemIdKey , pageSize }
    })
    const setNotFetcing = ( pagingId:string):MultiPaginatorAction => ({
      type: Types.SET_NOT_FETCHING,
      payload: { pagingId, error:null},
      meta: { endpoint, key, itemIdKey , pageSize }
    })
    const insertStatus = (pagingId:string, status:Status, isNew:boolean):InsertItemAction => ({
      type: Types.INSERT_ITEM_TO_PAGE,
      meta:{key, itemIdKey},
      item:status,
      isNew:isNew,
      pagingId
    })
    const setStatusReactions = (item:any, reactions:{ [id: string]: number[] },reaction_count:number):ItemMentionAction => ({
      type: Types.SET_STATUS_REACTIONS,
      meta:{key, itemIdKey},
      item,
      reactions,
      reaction_count
    });
    const pages = (pages:PageItem = {}, action:MultiPaginatorAction = {}) => {
      switch (action.type) 
      {
        case Types.SET_NOT_FETCHING:
        {
          let p = pages[action.payload!.pagingId] || getDefaultCachePage()
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
          let p = pages[action.payload!.pagingId] || getDefaultCachePage()
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
          let p = pages[action.payload!.pagingId] || getDefaultCachePage()
          return {
            ...pages,
            [action.payload!.pagingId]: {
              ...p,
              fetching: false,
              ids:p.ids.concat(action.payload!.results!.map(item => item[action.meta!.itemIdKey])).distinct(),
              totalCount: action.payload!.total || p.totalCount,
              error:action.payload!.error,
              last_fetch:Date.now()
            }
          }
        }
        case Types.INSERT_ITEM_TO_PAGE:
        {
          let a = action as InsertItemAction
          let p = pages[a.pagingId!] || getDefaultCachePage()
          let status = a.item as Status
          if(status.parent != null)
            return pages
          let newId = a.item[itemIdKey]
          let exist = p.ids.findIndex(id => id == newId) != -1
          if(exist || !a.isNew)
            return pages
          p.ids = p.ids.filter(id => id != newId)
          p.ids.unshift(newId)
          p.fetching = false
          if(a.isNew)
            p.totalCount = !!p.totalCount ? p.totalCount + 1 : 1
          p.error = null
          return {
            ...pages,
            [a.pagingId!]: {
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
    const onlyForEndpoint = (reducer:any) => (state = {}, action:any = {}) =>
    {
        if((action.meta && action.meta.key == key) || action.type == Types.RESET_PAGED_DATA)
        {
            return reducer(state, action)
        }
        return state
    }
    type reducerItems = {
      [key:string]: any
    }
    const itemsReducer = (items:reducerItems = {}, action:MultiPaginatorAction = {}) => { 
      switch (action.type) {
        case Types.RECEIVE_PAGE:
        {
          let _items = {}
          let res = flattenList(action.payload!.results!)
          for (let item of res) {  
            _items = {
              ..._items,
              [item[action.meta!.itemIdKey]]: item
            }
          }
          return {
            ...items,
            ..._items
          }
        }
        case Types.RESET_PAGED_DATA:
          return {}
        case Types.SET_STATUS_REACTIONS:
        {
          let a = action as ItemMentionAction
          let id = a.item[a.meta!.itemIdKey!]
          let status = {...items[id]} as Status
          status.reactions = {...a.reactions}
          status.reaction_count = a.reaction_count!
          return {
            ...items,
            [id]:status
          }
        }
        case Types.INSERT_ITEM_TO_PAGE:
        {
          let _items:reducerItems = {}
          let a = action as InsertItemAction
          let status = a.item as Status
          let res = flattenList([status])
          for (let item of res) {  
            _items = {
              ..._items,
              [item[action.meta!.itemIdKey]]: item
            }
          }
          let keys = Object.keys(_items)
          keys.forEach(k => 
            {
              let item = _items[k] as Status
              if(item.parent)
              {
                let p = Object.assign({}, items[item.parent]) as Status
                if(p)
                {
                  let arr = p.children_ids || [] 
                  let exists = arr.findIndex(id => id == item.id) != -1
                  p.serialization_date = item.serialization_date
                  if(!exists)
                  {
                    arr.unshift(item.id)
                    p.children_ids = arr
                    _items[p.id] = p
                  }
                }
              }
            })
          return {
            ...items,
            ..._items
          }
        }
        default:
          return items
      }
    }
    return {
      paginationReducer : onlyForEndpoint( pages ),
      itemsReducer: onlyForEndpoint(itemsReducer),
      requestNextStatusPage,
      setNotFetcing,
      insertStatus,
      setStatusReactions,
    }
  }