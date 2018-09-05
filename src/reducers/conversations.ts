import Constants from '../utilities/Constants';
import { createPaginator } from './createPaginator';
import { combineReducers } from 'redux';

export const conversationPaginator = createPaginator("conversations", Constants.apiRoute.conversations, "id", 3)
const conversationItemReducer = (state = {}, action) => {
    switch(action.type) 
    {
        default:
            return conversationPaginator.itemsReducer(state, action);
    }
}
export const conversations = combineReducers({ items:conversationItemReducer, pagination: conversationPaginator.paginationReducer })
