import {  Store } from 'redux';
import { ReduxState } from '../redux';
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
import { RequestErrorData, AppLanguage } from '../types/intrasocial_types';
import { SideMenuNavigationToggleMenuNotification } from '../components/navigation/SideMenuNavigation';
import { ResponsiveBreakpoint } from '../components/general/observers/ResponsiveComponent';
import { ContextDataResolverComponentLogContextDataNotification } from '../hoc/WithContextData';

const url = require('url');
const path = require("path")

export type AppWindowObject = {
    deleteCommunity:(id:number) => void
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
    setLanguage:(language:AppLanguage) => void
    language:string
    createError:() => void
    toggleMenu:() => void
    logContextData:() => void
    breakpoint:ResponsiveBreakpoint
}
export abstract class WindowAppManager
{
    static setup = () =>
    {
        if(!window.appRoot)
            window.appRoot = "/app/"
        window.app = {
            deleteCommunity:WindowAppManager.deleteCachedCommunity,
            sendOutgoingOnSocket:WindowAppManager.sendOutgoingOnSocket,
            sendInboundOnSocket:WindowAppManager.sendInboundOnSocket,
            hardReset:WindowAppManager.hardReset,
            softReset:WindowAppManager.softReset,
            sendMessageElectron:WindowAppManager.sendMessageElectron,
            setTheme:WindowAppManager.setTheme,
            resetMessageQueue:WindowAppManager.resetMessageQueue,
            navigateToRoute:WindowAppManager.navigateToRoute,
            setLanguage:WindowAppManager.setLanguage,
            language:WindowAppManager.language,
            createError:WindowAppManager.createError,
            toggleMenu:WindowAppManager.toggleMenu,
            breakpoint:ResponsiveBreakpoint.micro,
            logContextData:WindowAppManager.logContextData,
        }
        //
    }
    static logContextData = () => {
        NotificationCenter.push(ContextDataResolverComponentLogContextDataNotification,[])
    }
    static toggleMenu = () => {
        NotificationCenter.push(SideMenuNavigationToggleMenuNotification,[])
    }
    static createError = () => {
        try {
            const f:() => void = null;
            f()
        } catch (e) {
            const event = new ErrorEvent("error", {error:e})
            window.dispatchEvent(event)
        }
    }
    static setTheme = (index:number) => {
        ThemeManager.setTheme(index)
    }
    static setLanguage = (language:AppLanguage) => {
        WindowAppManager.getStore().dispatch(setLanguageAction(language))
    }
    static get language(): string {
        return WindowAppManager.getStore().getState().language.language
    }
    static sendMessageElectron = (channel:string, msg:any) => {
        if (window.isElectron) {
            window.ipcRenderer.send(channel, msg)
        }
    }
    static resetMessageQueue = () => {
        WindowAppManager.getStore().dispatch(resetMessageQueueAction())
    }
    static hardReset = () => {
        ApplicationManager.hardReset()
    }
    static softReset = () => {
        ApplicationManager.hardReset()
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
            ToastManager.showRequestErrorToast( new RequestErrorData( translate("common.data.error"), "error"))
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
