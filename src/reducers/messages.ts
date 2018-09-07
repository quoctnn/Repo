import { PaginationUtilities } from '../utilities/PaginationUtilities';
import Constants from '../utilities/Constants';
import { createMultiPaginator } from './createPaginator';
import { combineReducers } from 'redux';
import { Types } from '../utilities/Types';

export const messageReducerKey = "messages"
export const messageReducerPageSize = PaginationUtilities.calculatePageSize(40)
export const messagesPaginator = createMultiPaginator(messageReducerKey, Constants.apiRoute.conversationMessagesUrl, "id", messageReducerPageSize)
const messagesItemReducer = (state = {}, action) => {
  switch (action.type) {
    case Types.RESET_MESSAGES: {
      return {};
    }
    default:
      return messagesPaginator.itemsReducer(state, action);
  }
};
export const messages = combineReducers({
  items: messagesItemReducer,
  conversations: messagesPaginator.paginationReducer
});
