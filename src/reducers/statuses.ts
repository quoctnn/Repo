import { PaginationUtilities } from '../utilities/PaginationUtilities';
import Constants from '../utilities/Constants';
import { statusMultiPaginator } from './createPaginator';
import { combineReducers } from 'redux';
import { UploadedFile } from './conversations';
import { UserProfile } from './profileStore';

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
, "id", statusReducerPageSize)
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
export interface ICommunity
{
  absolute_url:string
  deactivated:boolean
  id:number
  name:string
  slug_name:string
  
}
export interface TempStatus 
{
  text: string
  privacy: string
  files_ids: number[]
  link: string
  context_natural_key?: string
  context_object_id?: number
  parent:number,
  mentions: number[]
  pending?:boolean
}
export interface Status extends TempStatus
{
    can_comment:boolean
    children:Status[]
    children_ids:number[]
    comments_count:number
    community:ICommunity
    context_object:{absolute_url:string, name:string}
    created_at:string
    edited_at:string
    files:UploadedFile[]
    id:number
    uid:number
    reactions:{ [id: string]: number[] }
    reaction_count:number
    owner:UserProfile
    permission_set:number[]
    poll:any
    read:boolean
    updated_at:string
    serialization_date:string
    extra?:string
    highlights?:{[id:string]:[string]}
}
