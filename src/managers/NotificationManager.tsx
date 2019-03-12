import React = require("react");
import { NotificationCenter } from "../notifications/NotificationCenter";
import { ToastManager } from './ToastManager';
import { Notification } from '../types/intrasocial_types2';
import { Store } from "redux";
import * as Actions from '../actions/Actions';
import { RootState } from "../reducers";
import { EventStreamMessageType } from "../app/network/ChannelEventStream";

export abstract class NotificationManager 
{
    static setup()
    {
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.NOTIFICATION_NEW, NotificationManager.processIncomingNewNotification)
    }
    static processIncomingNewNotification = (...args:any[]) => 
    {
        const notification = args[0] as Notification
        NotificationManager.getStore().dispatch(Actions.insertNotification(notification, true))
        ToastManager.showInfoToast(notification.display_text)
    }
    private static getStore = ():Store<RootState,any> =>
    {
        return window.store
    }

}