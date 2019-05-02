import {  Store } from 'redux';
import { ReduxState } from '../redux';
import { removeCommunityAction, resetCommunitiesAction } from '../redux/communityStore';
import { resetProjectsAction } from '../redux/projectStore';
import { resetEventsAction } from '../redux/eventStore';
import ReconnectingWebSocket from "reconnecting-websocket";
import { sendOnWebsocket, eventStreamNotificationPrefix } from '../network/ChannelEventStream';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { ToastManager } from './ToastManager';
import { translate } from '../localization/AutoIntlProvider';
import { resetGroupsAction } from '../redux/groupStore';
import { resetTasksAction } from '../redux/taskStore';
import { resetProfilesAction } from '../redux/profileStore';
import { setAuthenticationTokenAction, setAuthenticationProfileAction } from '../redux/authentication';
export type AppWindowObject = {
    deleteCommunity:(id:number) => void
    resetProjectStore:() => void
    resetEventStore:() => void
    user_locale?:string
    socket?:ReconnectingWebSocket
    sendOutgoingOnSocket:(data:object) => void
    sendInboundOnSocket:(data:{type:string, data:any}) => void
    clear:() => void
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
            sendInboundOnSocket:WindowAppManager.sendInboundOnSocket,
            clear:WindowAppManager.clear
        }
    }
    static resetEventStore = () => {
        WindowAppManager.getStore().dispatch(resetEventsAction())
    }
    static clear = () => {
        const dispatch =  WindowAppManager.getStore().dispatch
        dispatch(resetCommunitiesAction())
        dispatch(resetGroupsAction())
        dispatch(resetProjectsAction())
        dispatch(resetEventsAction())
        dispatch(resetTasksAction())
        dispatch(resetProfilesAction())
        dispatch(setAuthenticationTokenAction(null))
        dispatch(setAuthenticationProfileAction(null))
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
    static sendInboundOnSocket = (data:{type:string, data:any}) => {
        if(!data || !data.type)
        {
            ToastManager.showErrorToast(translate("common.data.error"))
            return
        }
        NotificationCenter.push(eventStreamNotificationPrefix + data.type,[data.data])
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store 
    }
}