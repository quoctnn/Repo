import { combineReducers } from 'redux'
import { Types } from '../utilities/Types'
export interface PaginatorAction
{
    type?:string
    payload?:{page:number, results?:any[], total?:number}
    meta?:{endpoint:string, key:string, itemIdKey:string, pageSize:number}
}
export const createPaginator = (key:string, endpoint:string, itemIdKey:string, pageSize:number) =>
{
    const requestPage = ( page:number):PaginatorAction => ({
      type: Types.REQUEST_PAGE,
      payload: { page },
      meta: { endpoint, key, itemIdKey , pageSize }
    })
    const pages = (pages = {}, action:PaginatorAction = {}) => {
      switch (action.type) {
        case Types.REQUEST_PAGE:
          return {
            ...pages,
            [action.payload.page]: {
              ids: [],
              fetching: true
            }
          }
        case Types.RECEIVE_PAGE:
          return {
            ...pages,
            [action.payload.page]: {
              ids: action.payload.results.map(item => item[action.meta.itemIdKey]),
              fetching: false
            }
          }
        case Types.RESET_PAGED_DATA: 
          return {}
        default:
          return pages
      }
    }
    const currentPage = (currentPage = 0, action:PaginatorAction = {}) =>
    {
      if(action.type == Types.REQUEST_PAGE)
        return action.payload.page || currentPage
      else if (action.type == Types.RESET_PAGED_DATA)
        return 0
      return currentPage
    }
      

    const totalCount = (totalCount = 0, action:PaginatorAction = {}) =>
    {
      if(action.type == Types.RECEIVE_PAGE) 
        return action.payload.total || totalCount
      else if (action.type == Types.RESET_PAGED_DATA)
        return 0
      return totalCount 
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
      paginationReducer : onlyForEndpoint( combineReducers({ pages, currentPage, totalCount }) ),
      itemsReducer: onlyForEndpoint(itemsReducer),
      requestPage
    }
  }