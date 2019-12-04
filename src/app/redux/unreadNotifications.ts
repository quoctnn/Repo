export type UnreadNotifications = {
    conversations: number
    notifications: number
}
export enum UnreadNotificationsActionTypes {
    SetUnreadConversations = 'unread_notifications.set_conversations',
    SetUnreadNotifications = 'unread_notifications.set_notifications',
    Reset = "unread_notifications.reset",
}
const INITIAL_STATE: UnreadNotifications = {
    conversations: 0,
    notifications: 0
}
export interface SetUnreadNotificationsAction {
    type: UnreadNotificationsActionTypes
    count: number
}
export const setUnreadNotificationsAction = (count: number): SetUnreadNotificationsAction => ({
    type: UnreadNotificationsActionTypes.SetUnreadNotifications,
    count
})
export const setUnreadConversationsAction = (count: number): SetUnreadNotificationsAction => ({
    type: UnreadNotificationsActionTypes.SetUnreadConversations,
    count
})
export const resetUnreadNotificationsAction = () => ({
    type: UnreadNotificationsActionTypes.Reset
})
export const unreadNotifications = (state = INITIAL_STATE, action: SetUnreadNotificationsAction): UnreadNotifications => {
    switch (action.type) {
        case UnreadNotificationsActionTypes.SetUnreadConversations:
            return { ...state, conversations: action.count }
        case UnreadNotificationsActionTypes.SetUnreadNotifications:
            return { ...state, notifications: action.count }
        case UnreadNotificationsActionTypes.Reset:
            return { notifications:0, conversations:0 }
        default:
            return state;
    }
}
