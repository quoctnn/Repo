import {  Store } from 'redux';
import { AuthenticationManager } from './AuthenticationManager';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventStreamMessageType, eventStreamNotificationPrefix, WebsocketState } from '../network/ChannelEventStream';
import { ReduxState } from '../redux/index';

export const EventStreamManagerConnectionChangedEvent = "EventStreamManagerConnectionChangedEvent"
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
        let state = args[0]
        console.log("eventstreamStateReceived", args)
        NotificationCenter.push(EventStreamManagerConnectionChangedEvent, [])
    }
    static socketDisconnected = () => 
    {
        EventStreamManager.connected = false
        NotificationCenter.push(EventStreamManagerConnectionChangedEvent, [])
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}