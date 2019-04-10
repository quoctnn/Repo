import { PaginationUtilities } from '../utilities/PaginationUtilities';
import Constants from '../utilities/Constants';
import { statusMultiPaginator } from './createPaginator';
import { combineReducers } from 'redux';

export const StatusContextKeys = {
  NEWSFEED : "newsfeed",
  CONTEXT: (key:string, id:number) => `${id}/${id}`
};
export const parseStatusContextKey = (key:string):{contextKey:string, contextId:number} => {
  if(key == StatusContextKeys.NEWSFEED)
    return {contextKey:key, contextId:null}
  let ret = {contextKey:null, contextId:null}
  let arr = key.split("/")
  if(arr.length > 1)
  {
    ret.contextId = arr[1]
  }
  if(arr.length > 0)
  {
    ret.contextId = arr[0]
  }
  return ret
}
export const statusReducerKey = "statuses"
export const statusReducerPageSize = PaginationUtilities.calculatePageSize(100)
export const statusesPaginator = statusMultiPaginator(statusReducerKey, (id:string) => 
{
  return Constants.apiRoute.newsfeed
}
, "id", statusReducerPageSize,"id", false, true)
const statusesItemReducer = (state = {}, action) => {
  switch (action.type) {
    default:
      return statusesPaginator.itemsReducer(state, action);
  }
};
export const statuses = combineReducers({
  items: statusesItemReducer,
  feed: statusesPaginator.paginationReducer
});