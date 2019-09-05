import {  Store } from 'redux';
import { ReduxState } from '../redux';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventStreamMessageType } from '../network/ChannelEventStream';
import { RecentActivity, UnreadNotificationCounts, UnhandledNotifications } from '../types/intrasocial_types';
import { setUnreadConversationsAction, setUnreadNotificationsAction } from '../redux/unreadNotifications';
import { ApplicationManagerApplicationLoadedNotification } from './ApplicationManager';
import { AuthenticationManager } from './AuthenticationManager';
import {ApiClient} from '../network/ApiClient';
export abstract class NotificationManager
{
    static setup = () =>
    {
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.ACTIVITY_NEW, NotificationManager.processNewActivity)
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.NOTIFICATIONS_UNHANDLED, NotificationManager.processUnhandledNotifications)
        NotificationCenter.addObserver(ApplicationManagerApplicationLoadedNotification, NotificationManager.processApplicationLoaded)
    }
    private static processUnhandledNotifications = (...args:any[]) => {
        let notifications = args[0] as UnreadNotificationCounts
        NotificationManager.processUnreadNotifications(notifications)
    }
    private static processApplicationLoaded = (...args:any[]) => {
        NotificationManager.updateNotificationsCount()
    }
    static updateNotificationsCount = () => {
        const user = AuthenticationManager.getAuthenticatedUser()
        if(user && !user.is_anonymous)
        {
            ApiClient.getUnreadNotifications((notifications, status, error) => {
                if(!!notifications && !error)
                    NotificationManager.processUnreadNotifications(notifications)
            })
        }
    }
    private static processUnreadNotifications = (notifications:UnreadNotificationCounts) => {
        const store = NotificationManager.getStore()
        const currentData = store.getState().unreadNotifications
        const unreadNotifications = notifications.total
        const unreadConversations = notifications.unread_conversations
        if(currentData.conversations != unreadConversations)
            store.dispatch(setUnreadConversationsAction(unreadConversations))
        if(currentData.notifications != unreadNotifications)
            store.dispatch(setUnreadNotificationsAction(unreadNotifications))
    }
    private static processNewActivity = (...args:any[]) => {
        let activity = args[0] as RecentActivity
        NotificationManager.processUnreadNotifications(activity.notifications)
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}