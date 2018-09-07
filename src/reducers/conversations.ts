import Constants from '../utilities/Constants';
import { createPaginator } from './createPaginator';
import { combineReducers } from 'redux';
import { PaginationUtilities } from '../utilities/PaginationUtilities';

export const conversationReducerKey = "conversations"
export const conversationReducerPageSize = PaginationUtilities.calculatePageSize(75)
export const conversationPaginator = createPaginator(conversationReducerKey, Constants.apiRoute.conversations, "id", conversationReducerPageSize)
const conversationItemReducer = (state = {}, action) => {
    switch(action.type) 
    {
        default:
            return conversationPaginator.itemsReducer(state, action);
    }
}
export const conversations = combineReducers({ items:conversationItemReducer, pagination: conversationPaginator.paginationReducer })  
