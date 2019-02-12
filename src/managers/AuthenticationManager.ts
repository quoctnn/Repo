import {  Store } from 'redux';
import * as Actions from '../actions/Actions';
import { RootState } from '../reducers';
import { AjaxRequest } from '../network/AjaxRequest';
import { UserProfile, UserStatus } from '../types/intrasocial_types';
import { sendOnWebsocket, EventStreamMessageType } from '../app/network/ChannelEventStream';
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
        return AuthenticationManager.getStore().getState().auth.profile
    }
    static getAuthenticationToken = () =>
    {
        return AuthenticationManager.getStore().getState().auth.authToken
    }
    static signIn(token:string|null)
    {
        AuthenticationManager.getStore().dispatch(Actions.setSignedIn(token))
    }
    static setAuthenticatedUser(profile:UserProfile|null)
    {
        AjaxRequest.setup(AuthenticationManager.getAuthenticationToken())
        AuthenticationManager.getStore().dispatch(Actions.setSignedInProfile(profile))
        AuthenticationManager.updateProfileStatus(profile)
        if(profile)
        {
            AuthenticationManager.getStore().dispatch(Actions.setDirtyPagedData())
        }
    }
    static clearKeepAliveTimer()
    {
        clearInterval(AuthenticationManager.keepAlive);
        AuthenticationManager.keepAlive = null;
    }
    static signOut()
    {
        let store = AuthenticationManager.getStore();

        // Remove the keepAlive (last_seen) timer and eventListeners
        AuthenticationManager.clearKeepAliveTimer()
        document.removeEventListener('mousedown', AuthenticationManager.resetUserActivityCounter);
        window.removeEventListener('focus', AuthenticationManager.resetUserActivityCounter);

        // Clean up cached data
        store.dispatch(Actions.resetCommunityStore());
        store.dispatch(Actions.resetGroupStore());
        store.dispatch(Actions.resetCommunityGroupsCache());
        store.dispatch(Actions.resetProfileStore());

        // Clean up userProfile and token
        store.dispatch(Actions.setSignedIn(null));
        store.dispatch(Actions.setAuthorizationData(null, null));
        AuthenticationManager.setAuthenticatedUser(null);
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
    private static getStore = ():Store<RootState,any> =>
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