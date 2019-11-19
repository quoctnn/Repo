import {  Store } from 'redux';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventStreamMessageType, eventStreamNotificationPrefix } from '../network/ChannelEventStream';
import { ReduxState } from '../redux/index';
import ReconnectingWebSocket from 'reconnecting-websocket';

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
        if(ReconnectingWebSocket.CLOSED == args[0])
            EventStreamManager.socketDisconnected()
    }
    static eventstreamStateReceived = (...args:any[]) =>
    {
        EventStreamManager.connected = true
        let state = args[0]
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