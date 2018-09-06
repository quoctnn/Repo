import { PaginationUtilities } from '../utilities/PaginationUtilities';
import Constants from '../utilities/Constants';
import { createMultiPaginator } from './createPaginator';
import { combineReducers } from 'redux';


export const messagesPaginator = createMultiPaginator("messages", Constants.apiRoute.conversationMessagesUrl, "id", PaginationUtilities.calculatePageSize(40))
const messagesItemReducer = (state = {}, action) => {
    switch(action.type) 
    {
        default:
            return messagesPaginator.itemsReducer(state, action);
    }
}
export const messages = combineReducers({ items:messagesItemReducer, conversations: messagesPaginator.paginationReducer })
