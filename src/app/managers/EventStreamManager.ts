import {  Store } from 'redux';
import { ProfileManager } from './ProfileManager';
import { CommunityManager } from './CommunityManager';
import { AuthenticationManager } from './AuthenticationManager';
import { UserProfile } from '../types/intrasocial_types';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventStreamMessageType, eventStreamNotificationPrefix, WebsocketState } from '../network/ChannelEventStream';
import { ReduxState } from '../redux/index';
export abstract class EventStreamManager
{
    static connected:boolean = false
    static setup = () => 
    {
        NotificationCenter.addObserver(eventStreamNotificationPrefix + EventStreamMessageType.STATE, EventStreamManager.eventstreamStateReceived)
        NotificationCenter.addObserver(eventStreamNotificationPrefix + EventStreamMessageType.SOCKET_STATE_CHANGE, EventStreamManager.eventstreamSocketStateChanged)
    }
    static eventstreamSocketStateChanged = (...args:any[]) => 
    {
        console.log("eventstreamSocketStateChanged args", args)
        if(WebsocketState.CLOSED == args[0])
            EventStreamManager.socketDisconnected()
        AuthenticationManager.clearKeepAliveTimer()
    }
    static eventstreamStateReceived = (...args:any[]) => 
    {
        EventStreamManager.connected = true
        console.log("eventstreamStateReceived", args)
        let state = args[0]
        const {anonymous, channel_name} = state
        EventStreamManager.connected = true

    }
    static socketDisconnected = () => 
    {
        EventStreamManager.connected = false
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}