import Constants from '../utilities/Constants';
import { createPaginator } from './createPaginator';
import { combineReducers } from 'redux';
import { PaginationUtilities } from '../utilities/PaginationUtilities';
import { Types } from '../utilities/Types';

export const conversationPaginator = createPaginator(
  'conversations',
  Constants.apiRoute.conversations,
  'id',
  PaginationUtilities.calculatePageSize(75)
);
const conversationItemReducer = (state = {}, action) => {
  switch (action.type) {
    case Types.RESET_CONVERSATIONS: {
      return {};
    }
    default:
      return conversationPaginator.itemsReducer(state, action);
  }
};
export const conversations = combineReducers({
  items: conversationItemReducer,
  pagination: conversationPaginator.paginationReducer
});
