import React = require("react");
import { NotificationCenter } from "../notifications/NotificationCenter";
import { EventStreamMessageType } from "../components/general/ChannelEventStream";
import { ToastManager } from './ToastManager';
import { Notification } from '../types/intrasocial_types';

export abstract class NotificationManager 
{
    static setup()
    {
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.NOTIFICATION_NEW, NotificationManager.processIncomingNewNotification)
    }
    static processIncomingNewNotification = (...args:any[]) => {
        const notification = args[0] as Notification
        ToastManager.showInfoToast(notification.message)
    }
}