import {  Store } from 'redux';
import { ReduxState } from '../redux';
import { removeCommunityAction } from '../redux/communityStore';
import { resetProjectsAction } from '../redux/projectStore';
import { resetEventsAction } from '../redux/eventStore';
import ReconnectingWebSocket from "reconnecting-websocket";
import { sendOnWebsocket, eventStreamNotificationPrefix } from '../network/ChannelEventStream';
import { NotificationCenter } from '../utilities/NotificationCenter';
export type AppWindowObject = {
    deleteCommunity:(id:number) => void
    resetProjectStore:() => void
    resetEventStore:() => void
    user_locale?:string
    socket?:ReconnectingWebSocket
    sendOutgoingOnSocket:(data:object) => void
    sendIncomingOnSocket:(data:{type:string, data:any}) => void
}
export abstract class WindowAppManager
{
    static setup = () => 
    {
        window.app = {
            deleteCommunity:WindowAppManager.deleteCachedCommunity,
            resetProjectStore:WindowAppManager.resetProjectStore, 
            resetEventStore:WindowAppManager.resetEventStore,
            sendOutgoingOnSocket:WindowAppManager.sendOutgoingOnSocket,
            sendIncomingOnSocket:WindowAppManager.sendIncomingOnSocket
        }
    }
    static resetEventStore = () => {
        WindowAppManager.getStore().dispatch(resetEventsAction())
    }
    static resetProjectStore = () => {
        WindowAppManager.getStore().dispatch(resetProjectsAction())
    }
    static deleteCachedCommunity = (id:number) => {
        WindowAppManager.getStore().dispatch(removeCommunityAction(id))
    }
    static sendOutgoingOnSocket = (data:object) => {
        sendOnWebsocket(JSON.stringify(data))
    }
    static sendIncomingOnSocket = (data:{type:string, data:any}) => {
        NotificationCenter.push(eventStreamNotificationPrefix + data.type,[data.data])
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store 
    }
}