import {  Store } from 'redux';
import { AjaxRequest } from '../network/AjaxRequest';
import { UserProfile, UserStatus, RecentActivity, AppLanguage } from '../types/intrasocial_types';
import {EventStreamMessageType } from '../network/ChannelEventStream';
import { ReduxState } from '../redux/index';
import { setAuthenticationProfileAction, setAuthenticationTokenAction } from '../redux/authentication';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { ApplicationManager } from './ApplicationManager';
import { CommunityManager } from './CommunityManager';
import { ToastManager } from './ToastManager';
import { WindowAppManager } from './WindowAppManager';
import { setLanguageAction } from '../redux/language';

export const AuthenticationManagerAuthenticatedUserChangedNotification = "AuthenticationManagerAuthenticatedUserChangedNotification"
export abstract class AuthenticationManager
{
    private static previous: number = 0;
    private static lastUserActivity: number = 0;
    private static keepAliveFrequency: number = 5; // How often do we send keepAlive message (in seconds)
    private static keepAlive: (NodeJS.Timer|null);

    static setup = () =>
    {
        console.log("AuthenticationManager setup")
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.CLIENT_STATUS_CHANGE, AuthenticationManager.processIncomingUserUpdate)
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.COMMUNITY_MAIN, AuthenticationManager.processSwitchedMainCommunity)
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.ACTIVITY_NEW, AuthenticationManager.newActivityReceived)
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.CLIENT_UPDATE, AuthenticationManager.processClientUpdate)
    }
    private static processClientUpdate(...args:any[]) {
        let profile = args[0]
        AuthenticationManager.setUpdatedProfileStatus(profile)
    }

    static newActivityReceived = (...args:any[]) => {
        const activity = args[0] as RecentActivity;
        if (activity) ToastManager.showInfoToast(activity.display_text, null, activity.uri);
    }

    static processIncomingUserUpdate = (...args:any[]) => {
        let status = args[0]['status'] as UserStatus;
        const currentProfile = AuthenticationManager.getAuthenticatedUser()
        if(!currentProfile)
            return
        let profile = Object.assign({}, currentProfile)
        profile.user_status = status
        AuthenticationManager.setUpdatedProfileStatus(profile)

    }
    static processSwitchedMainCommunity = (...args:any[]) => {
        let community = args[0]['community_id'] as number;
        const currentProfile = AuthenticationManager.getAuthenticatedUser()
        if(!currentProfile)
            return
        let profile = Object.assign({}, currentProfile)
        profile.active_community = community
        AuthenticationManager.setUpdatedProfileStatus(profile)
        // Refresh the UI
        CommunityManager.setInitialCommunity(community)
    }
    static getAuthenticatedUser = () =>
    {
        return AuthenticationManager.getStore().getState().authentication.profile
    }
    static getAuthenticationToken = () =>
    {
        return AuthenticationManager.getStore().getState().authentication.token
    }
    static get isSignedIn()
    {
        return AuthenticationManager.getStore().getState().authentication.signedIn
    }
    static signIn = (token:string) =>
    {
        //AjaxRequest.setup(token)
        AuthenticationManager.getStore().dispatch(setAuthenticationTokenAction(token))
        AjaxRequest.setup(token)
        ApplicationManager.loadApplication(true)
    }
    static signInCurrent = () => {

        const token = AuthenticationManager.getAuthenticationToken()
        AjaxRequest.setup(token)
        ApplicationManager.loadApplication(false)
    }
    static setAuthenticatedUser(profile:UserProfile|null)
    {
        //AjaxRequest.setup(AuthenticationManager.getAuthenticationToken())
        AuthenticationManager.setUpdatedProfileStatus(profile)
        AuthenticationManager.updateProfileStatus(profile)
        if(profile)
        {
            //AuthenticationManager.getStore().dispatch(Actions.setDirtyPagedData())
        }
        NotificationCenter.push(AuthenticationManagerAuthenticatedUserChangedNotification,[{profile}])
    }
    static setUpdatedProfileStatus = (profile:UserProfile) => {
        let updateLanguage:AppLanguage = null
        const currentLanguage = AuthenticationManager.getStore().getState().language.language
        if(!!profile)
        {
            if(currentLanguage != profile.locale)
            {
                updateLanguage = profile.locale
            }
        }
        else if( currentLanguage != AppLanguage.english){
            updateLanguage = AppLanguage.english
        }
        AuthenticationManager.getStore().dispatch(setAuthenticationProfileAction(profile))
        if(updateLanguage)
        {
            AuthenticationManager.getStore().dispatch(setLanguageAction(updateLanguage))
        }
    }
    static clearKeepAliveTimer()
    {
        clearInterval(AuthenticationManager.keepAlive);
        AuthenticationManager.keepAlive = null;
    }
    static signOut()
    {
        // Remove the keepAlive (last_seen) timer and eventListeners
        AuthenticationManager.clearKeepAliveTimer()
        document.removeEventListener('mousedown', AuthenticationManager.resetUserActivityCounter);
        window.removeEventListener('focus', AuthenticationManager.resetUserActivityCounter);

        // Clean up userProfile and token
        AuthenticationManager.getStore().dispatch(setAuthenticationTokenAction(null))
        AuthenticationManager.setUpdatedProfileStatus(null)
        AjaxRequest.setup(null)
        ApplicationManager.loadApplication(true)

    }
    static resetUserActivityCounter()
    {
        AuthenticationManager.lastUserActivity = Math.floor(Date.now() / 1000)
        let profile = AuthenticationManager.getAuthenticatedUser() as UserProfile;
        if (profile && profile.user_status == UserStatus.away){
            WindowAppManager.sendOutgoingOnSocket(
                JSON.stringify({
                type: EventStreamMessageType.CLIENT_LAST_SEEN,
                data: { seconds: 0 }
                })
            )
        }
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
    private static updateProfileStatus = (profile:UserProfile|null) =>
    {
        if (profile) {
            // Setup the keep-alive (last_seen) timer, and eventListeners
            AuthenticationManager.resetUserActivityCounter();
            document.addEventListener('mousedown', AuthenticationManager.resetUserActivityCounter);
            window.addEventListener('focus', AuthenticationManager.resetUserActivityCounter);
            AuthenticationManager.keepAlive = setInterval(
                () => {
                    const currentTimeout = Math.floor(Date.now() / 1000) - AuthenticationManager.lastUserActivity
                    if (AuthenticationManager.previous + 60 < currentTimeout) {
                        window.app.socket.reconnect()
                    }
                    AuthenticationManager.previous = currentTimeout
                    WindowAppManager.sendOutgoingOnSocket(
                        JSON.stringify({
                        type: EventStreamMessageType.CLIENT_LAST_SEEN,
                        data: { seconds: currentTimeout }
                        })
                    );
                }, AuthenticationManager.keepAliveFrequency * 1000);
        }
        else {

            AuthenticationManager.clearKeepAliveTimer()
            document.removeEventListener('mousedown', AuthenticationManager.resetUserActivityCounter);
            window.removeEventListener('focus', AuthenticationManager.resetUserActivityCounter);
        }
    }
}