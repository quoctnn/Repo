import {  Store } from 'redux';
import { AjaxRequest } from '../network/AjaxRequest';
import { UserProfile, UserStatus, ContextNaturalKey, RecentActivity } from '../types/intrasocial_types';
import {EventStreamMessageType } from '../network/ChannelEventStream';
import { ReduxState } from '../redux/index';
import { setAuthenticationProfileAction, setAuthenticationTokenAction } from '../redux/authentication';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { ApplicationManager } from './ApplicationManager';
import { CommunityManager } from './CommunityManager';
import { ContextManager } from './ContextManager';
import { ToastManager } from './ToastManager';
import { WindowAppManager } from './WindowAppManager';

export const AuthenticationManagerAuthenticatedUserChangedNotification = "AuthenticationManagerAuthenticatedUserChangedNotification"
export abstract class AuthenticationManager
{
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
        if (activity) ToastManager.showInfoToast(activity.display_text);
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
        if (!ContextManager.getContextObject(window.routerHistory.location.pathname, ContextNaturalKey.COMMUNITY)) {
            CommunityManager.applyCommunityTheme(CommunityManager.getActiveCommunity())
        }

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
        AuthenticationManager.getStore().dispatch(setAuthenticationProfileAction(profile))
        AuthenticationManager.updateProfileStatus(profile)
        if(profile)
        {
            //AuthenticationManager.getStore().dispatch(Actions.setDirtyPagedData())
        }
        NotificationCenter.push(AuthenticationManagerAuthenticatedUserChangedNotification,[{profile}])
    }
    static setUpdatedProfileStatus = (profile:UserProfile) => {

        AuthenticationManager.getStore().dispatch(setAuthenticationProfileAction(profile))
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
        AuthenticationManager.getStore().dispatch(setAuthenticationProfileAction(null))
        AjaxRequest.setup(null)
        ApplicationManager.loadApplication(true)

    }
    static resetUserActivityCounter()
    {
        AuthenticationManager.lastUserActivity = 0
        let profile = AuthenticationManager.getAuthenticatedUser() as UserProfile;
        if (profile && profile.user_status == UserStatus.away){
            WindowAppManager.sendOutgoingOnSocket(
                JSON.stringify({
                type: EventStreamMessageType.CLIENT_LAST_SEEN,
                data: { seconds: AuthenticationManager.lastUserActivity }
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
                    AuthenticationManager.lastUserActivity += AuthenticationManager.keepAliveFrequency;
                    WindowAppManager.sendOutgoingOnSocket(
                        JSON.stringify({
                        type: EventStreamMessageType.CLIENT_LAST_SEEN,
                        data: { seconds: AuthenticationManager.lastUserActivity }
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