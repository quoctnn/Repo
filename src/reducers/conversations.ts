import Constants from '../utilities/Constants';
import { createPaginator } from './createPaginator';
import { combineReducers } from 'redux';
import { PaginationUtilities } from '../utilities/PaginationUtilities';

export const conversationPaginator = createPaginator("conversations", Constants.apiRoute.conversations, "id", PaginationUtilities.calculatePageSize(75))
const conversationItemReducer = (state = {}, action) => {
    switch(action.type) 
    {
        default:
            return conversationPaginator.itemsReducer(state, action);
    }
}
export const conversations = combineReducers({ items:conversationItemReducer, pagination: conversationPaginator.paginationReducer })
