import { PaginationUtilities } from '../utilities/PaginationUtilities';
import Constants from '../utilities/Constants';
import { combineReducers } from 'redux';
import { simpleMultiPaginator } from './simpleMultiPaginator';

export const messageReducerKey = "messages"
export const messageReducerPageSize = PaginationUtilities.calculatePageSize(40)
export const messagesPaginator = simpleMultiPaginator(messageReducerKey, Constants.apiRoute.conversationMessagesUrl, "id", messageReducerPageSize, "created_at", false)
export const messages = combineReducers({
  conversations: messagesPaginator.paginationReducer
});
