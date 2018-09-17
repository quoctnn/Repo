import Constants from '../utilities/Constants';
import { createPaginator } from './createPaginator';
import { combineReducers } from 'redux';
import { PaginationUtilities } from '../utilities/PaginationUtilities';
import { Types } from '../utilities/Types';
import * as moment from 'moment-timezone';
let timezone = moment.tz.guess()


export const conversationReducerKey = "conversations"
export const conversationReducerPageSize = PaginationUtilities.calculatePageSize(75)
export const conversationPaginator = createPaginator(conversationReducerKey, Constants.apiRoute.conversations, "id", conversationReducerPageSize)
const conversationItemReducer = (state = {}, action) => {
  switch (action.type) {
    default:
      return conversationPaginator.itemsReducer(state, action);
  }
};
export const conversations = combineReducers({
  items: conversationItemReducer,
  pagination: conversationPaginator.paginationReducer
});


export class Message 
{
    id:number
    pending?:boolean
    uid:string
    user:number
    conversation:number
    text:string
    attachment:any
    created_at:string 
    updated_at:string
    read_by:number[]
    mentions:number[]
}
export class Conversation
{
    id:number
    title:string
    users:number[]
    archived_by: number[]
    last_message:Message
    read_by:any[]
    absolute_url:string
    created_at:string
    updated_at:string
    unread_messages:number[]
    constructor(id:number,
        title:string,
        users:number[],
        archived_by: number[],
        last_message:Message,
        read_by:any[],
        absolute_url:string,
        created_at:string,
        updated_at:string)
    {
        this.id = id
        this.title = title
        this.users = users
        this.archived_by = archived_by
        this.last_message = last_message
        this.read_by = read_by
        this.absolute_url = absolute_url
        this.created_at = created_at
        this.updated_at = updated_at
    }
}