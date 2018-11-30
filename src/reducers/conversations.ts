import { simplePaginator } from './simplePaginator';
import { combineReducers } from 'redux';
import { PaginationUtilities } from '../utilities/PaginationUtilities';
import Constants from '../utilities/Constants';
import { Conversation } from '../types/intrasocial_types';


export const conversationReducerKey = "conversations"
export const conversationReducerPageSize = PaginationUtilities.calculatePageSize(75)
export const conversationPaginator = simplePaginator<Conversation>(conversationReducerKey, Constants.apiRoute.conversations, "id", "updated_at", false, conversationReducerPageSize)
export const conversations = combineReducers({
  pagination: conversationPaginator.paginationReducer
});