import {  Store } from 'redux';
import { AjaxRequest } from '../network/AjaxRequest';
import { UserProfile, UserStatus } from '../types/intrasocial_types';
import { sendOnWebsocket, EventStreamMessageType } from '../network/ChannelEventStream';
import { ReduxState } from '../redux/index';
import { setAuthenticationProfileAction, setAuthenticationTokenAction } from '../redux/authentication';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { ApplicationManager } from './ApplicationManager';
import { resetCommunitiesAction } from '../redux/communityStore';
import { resetGroupsAction } from '../redux/groupStore';
import { resetProfilesAction } from '../redux/profileStore';
import { contactListResetAction } from '../redux/contactListCache';

export const AuthenticationManagerAuthenticatedUserChangedNotification = "AuthenticationManagerAuthenticatedUserChangedNotification"
export abstract class AuthenticationManager
{
    private static lastUserActivity: number = 0;
    private static keepAliveFrequency: number = 60; // How often do we send keepAlive message (in seconds)
    private static keepAlive: (NodeJS.Timer|null);

    static setup = () =>
    {
    }
    static getAuthenticatedUser = () =>
    {
        return AuthenticationManager.getStore().getState().authentication.profile
    }
    static getAuthenticationToken = () =>
    {
        return AuthenticationManager.getStore().getState().authentication.token
    }
    static signIn(token:string)
    {
        AuthenticationManager.getStore().dispatch(setAuthenticationProfileAction(null))
        AjaxRequest.setup(token)
        AuthenticationManager.getStore().dispatch(setAuthenticationTokenAction(token))
        ApplicationManager.loadApplication()
    }
    static signInCurrent = () => {

        const authToken = AuthenticationManager.getAuthenticationToken()
        AuthenticationManager.signIn(authToken)
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
        const store = AuthenticationManager.getStore()
        // Clean up cached data
        store.dispatch(resetCommunitiesAction());
        store.dispatch(resetGroupsAction());
        store.dispatch(resetProfilesAction());
        store.dispatch(contactListResetAction());


        // Clean up userProfile and token
        AuthenticationManager.signIn(null)
    }
    static resetUserActivityCounter()
    {
        AuthenticationManager.lastUserActivity = 0
        let profile = AuthenticationManager.getAuthenticatedUser() as UserProfile;
        if (profile && profile.user_status == UserStatus.away){
            sendOnWebsocket(
                JSON.stringify({
                type: EventStreamMessageType.USER_LAST_SEEN,
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
                function() {
                    AuthenticationManager.lastUserActivity += AuthenticationManager.keepAliveFrequency;
                    sendOnWebsocket(
                        JSON.stringify({
                        type: EventStreamMessageType.USER_LAST_SEEN,
                        data: { seconds: AuthenticationManager.lastUserActivity }
                        })
                    );
                }, AuthenticationManager.keepAliveFrequency * 1000);
        }
    }
}