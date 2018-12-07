import { simplePaginator } from './simplePaginator';
import { combineReducers } from 'redux';
import { PaginationUtilities } from '../utilities/PaginationUtilities';
import Constants from '../utilities/Constants';
import { Notification } from '../types/intrasocial_types';


export const notificationsReducerKey = "notifications"
export const notificationsReducerPageSize = PaginationUtilities.calculatePageSize(75)
export const notificationsPaginator = simplePaginator<Notification>(notificationsReducerKey, Constants.apiRoute.notificationUrl, "serialization_id", "created_at", false, notificationsReducerPageSize)
export const notifications = combineReducers({
  pagination: notificationsPaginator.paginationReducer
});