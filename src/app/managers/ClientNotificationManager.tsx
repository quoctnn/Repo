import * as React from 'react';
import {  Store } from 'redux';
import { ReduxState, ReduxKeys } from '../redux';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventStreamMessageType } from '../network/ChannelEventStream';
import { EventSubscription } from 'fbemitter';
import { ToastManager } from './ToastManager';
import ConfirmDialog from '../components/general/dialogs/ConfirmDialog';
import { translate } from '../localization/AutoIntlProvider';
import Routes from '../utilities/Routes';
import { resetApplicationAction } from '../redux/application';
import { resetLanguageAction } from '../redux/language';
import { resetThemeAction, resetFontSizeAction } from '../redux/theme';
import { resetEndpointAction } from '../redux/endpoint';
import { resetAuthenticationDataAction } from '../redux/authentication';
import { resetCommunitiesAction } from '../redux/communityStore';
import { resetProfilesAction } from '../redux/profileStore';
import { resetConversationsAction } from '../redux/conversationStore';
import { resetFavoritesAction } from '../redux/favoriteStore';
import { resetActiveCommunityAction } from '../redux/activeCommunity';
import { resetMessageQueueAction } from '../redux/messageQueue';
import { resetUnreadNotificationsAction } from '../redux/unreadNotifications';
import { resetTemporaryCacheAction } from '../redux/tempCache';
import { resetEmbedlyStoreAction } from '../components/general/embedly/redux';

type Props = {

}
type State = {
    clientReloadDialogVisible:boolean
}
export default class ClientNotificationManager extends React.Component<Props, State> {
    observers:EventSubscription[] = []
    constructor(props:Props){
        super(props)
        this.state = {
            clientReloadDialogVisible:false
        }
        this.observers.push(NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.CLIENT_RELOAD, this.processClientReload))
        this.observers.push(NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.CLIENT_SIGNOUT, this.processSignout))
        this.observers.push(NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.CLIENT_DISCONNECT, this.processDisconnect))
        this.observers.push(NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.CLIENT_REDUX_FLUSH, this.processReduxFlush))
        this.observers.push(NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.CLIENT_MESSAGE, this.processClientMessage))
    }
    componentWillUnmount = () => {
        this.observers.forEach(o => o.remove())
        this.observers = null
    }
    toggleClientReloadDialogVisible = () => {
        this.setState((prevState:State) => {
            return {clientReloadDialogVisible:!prevState.clientReloadDialogVisible}
        })
    }
    private getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
    private processClientReload = (...args:any[]) => {
        this.toggleClientReloadDialogVisible()
    }
    private processSignout = (...args:any[]) => {
        window.app.navigateToRoute(Routes.SIGNOUT)
    }
    private processDisconnect = (...args:any[]) => {
        window.app.socket.close()
    }
    private processReduxFlush = (...args:any[]) => {
        let keys:ReduxKeys[] = args[0];
        if(!Array.isArray(keys))
        {
            keys = []
        }
        if(keys.length == 0)
        {
            window.app.hardReset()
            return
        }
        const dispatch = this.getStore().dispatch
        keys.forEach(k => this.dispatchReset(k, dispatch))
    }
    private dispatchReset = (key:ReduxKeys, dispatch:React.Dispatch<any>) => {
        switch (key) {
                case ReduxKeys.language:dispatch(resetLanguageAction());break;
                case ReduxKeys.theme:dispatch(resetThemeAction()); dispatch(resetFontSizeAction());break;
                case ReduxKeys.endpoint:dispatch(resetEndpointAction());break;
                case ReduxKeys.authentication:dispatch(resetAuthenticationDataAction());break;
                case ReduxKeys.embedlyStore:dispatch(resetEmbedlyStoreAction());break;
                case ReduxKeys.communityStore:dispatch(resetCommunitiesAction());break;
                case ReduxKeys.profileStore:dispatch(resetProfilesAction());break;
                case ReduxKeys.conversationStore:dispatch(resetConversationsAction());break;
                case ReduxKeys.favoriteStore:dispatch(resetFavoritesAction());break;
                case ReduxKeys.activeCommunity:dispatch(resetActiveCommunityAction());break;
                case ReduxKeys.application:dispatch(resetApplicationAction());break;
                case ReduxKeys.messageQueue:dispatch(resetMessageQueueAction());break;
                case ReduxKeys.tempCache:dispatch(resetTemporaryCacheAction());break;
                case ReduxKeys.unreadNotifications:dispatch(resetUnreadNotificationsAction());break;
            default:
                break;
        }
    }
    private processClientMessage = (...args:any[]) => {
        const data = args[0]
        let message:string = null
        if(data){
            if(typeof(data) == "string")
            {
                message = data
            }
            else message = data && JSON.stringify(data)
        }
        ToastManager.showInfoToast(message)
    }
    handleConfirmedReload = (confirmed:boolean) => {
        this.toggleClientReloadDialogVisible()
        if(confirmed)
            if(window.isElectron) {
                window.location.href = "file://" + window.appRoot + "/app/electron.html"
            }
            else window.location.reload()
    }
    renderConfirmReload = () => {
        const visible = this.state.clientReloadDialogVisible
        const title = translate("context.confirm.update.title")
        const message = translate("context.confirm.update.message")
        const okTitle = translate("Reload")
        return <ConfirmDialog visible={visible} title={title} message={message} didComplete={this.handleConfirmedReload} okButtonTitle={okTitle}/>
    }
    render = () => {
        return <>
        {this.renderConfirmReload()}
        </>
    }
}