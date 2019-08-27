import {  Store } from 'redux';
import { ReduxState } from '../redux';
import { resetProjectsAction } from '../redux/projectStore';
import { resetEventsAction } from '../redux/eventStore';
import ReconnectingWebSocket from "reconnecting-websocket";
import { eventStreamNotificationPrefix } from '../network/ChannelEventStream';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { ToastManager } from './ToastManager';
import { translate } from '../localization/AutoIntlProvider';
import { ThemeManager } from './ThemeManager';
import { resetMessageQueueAction } from '../redux/messageQueue';
import { ApplicationManager } from './ApplicationManager';
import { CommunityManager } from './CommunityManager';
import { Settings } from '../utilities/Settings';
import { setLanguageAction } from '../redux/language';

const url = require('url');
const path = require("path")

export type AppWindowObject = {
    deleteCommunity:(id:number) => void
    resetProjectStore:() => void
    resetEventStore:() => void
    resetMessageQueue:() => void
    user_locale?:string
    socket?:ReconnectingWebSocket
    sendOutgoingOnSocket:(data:string) => void
    sendInboundOnSocket:(data:{type:string, data:any}) => void
    hardReset:() => void
    softReset:() => void
    sendMessageElectron:(channel:string, msg:any) => void
    setTheme:(index:number) => void
    navigateToRoute:(route:string, modal?:boolean) => void
    setLanguage:(index:number) => void
}
export abstract class WindowAppManager
{
    static setup = () =>
    {
        if(!window.appRoot)
            window.appRoot = "/app/"
        window.app = {
            deleteCommunity:WindowAppManager.deleteCachedCommunity,
            resetProjectStore:WindowAppManager.resetProjectStore,
            resetEventStore:WindowAppManager.resetEventStore,
            sendOutgoingOnSocket:WindowAppManager.sendOutgoingOnSocket,
            sendInboundOnSocket:WindowAppManager.sendInboundOnSocket,
            hardReset:WindowAppManager.hardReset,
            softReset:WindowAppManager.softReset,
            sendMessageElectron:WindowAppManager.sendMessageElectron,
            setTheme:WindowAppManager.setTheme,
            resetMessageQueue:WindowAppManager.resetMessageQueue,
            navigateToRoute:WindowAppManager.navigateToRoute,
            setLanguage:WindowAppManager.setLanguage
        }
        //
    }
    static setTheme = (index:number) => {
        ThemeManager.setTheme(index)
    }
    static setLanguage = (index:number) => {
        WindowAppManager.getStore().dispatch(setLanguageAction(index))
    }
    static sendMessageElectron = (channel:string, msg:any) => {
        if (window.isElectron) {
            window.ipcRenderer.send(channel, msg)
        }
    }
    static resetMessageQueue = () => {
        WindowAppManager.getStore().dispatch(resetMessageQueueAction())
    }
    static resetEventStore = () => {
        WindowAppManager.getStore().dispatch(resetEventsAction())
    }
    static hardReset = () => {
        ApplicationManager.hardReset()
    }
    static softReset = () => {
        ApplicationManager.hardReset()
    }
    static resetProjectStore = () => {
        WindowAppManager.getStore().dispatch(resetProjectsAction())
    }
    static deleteCachedCommunity = (id:number) => {
        CommunityManager.removeCommunity(id)
    }
    static sendOutgoingOnSocket = (data:string) => {
        if(WindowAppManager.canSendOnWebsocket())
            window.app.socket.send(data)
    }
    static canSendOnWebsocket = () => {
        return window.app.socket && window.app.socket.readyState == ReconnectingWebSocket.OPEN
    }
    static navigateToRoute = (route:string, modal = false) => {
        window.routerHistory.push(route, {modal})
    }
    static sendInboundOnSocket = (data:{type:string, data:any}) => {
        if(!data || !data.type)
        {
            ToastManager.showErrorToast(translate("common.data.error"))
            return
        }
        NotificationCenter.push(eventStreamNotificationPrefix + data.type,[data.data])
    }
    static resolveLocalFileUrl = (file:string) => {
        if (Settings.isElectron) {
            return url.format({
                pathname: path.join(window.appRoot, "app", file),
                protocol: location.protocol,
                host:location.host,
                slashes: true,
            })
        } else if (Settings.CDN) {
            return url.format({
                protocol: "https",
                host:Settings.CDNHost,
                pathname: path.join(Settings.CDNPath, window.appRoot, file),
                slashes: true,
            })
        }
        return url.format({
            pathname: path.join(window.appRoot, file),
            protocol: location.protocol,
            host:location.host,
            slashes: true,
        })
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}
