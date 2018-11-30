import {  Store } from 'redux';
import { UserProfile } from '../reducers/profileStore';
import * as Actions from '../actions/Actions';
import { RootState } from '../reducers';
import { AjaxRequest } from '../network/AjaxRequest';
import { sendOnWebsocket, EventStreamMessageType } from '../components/general/ChannelEventStream';
export abstract class AuthenticationManager
{
    private static lastUserActivity: number = 0;
    // How often do we send keepAlive message (in seconds)
    private static keepAliveFrequency: number = 60;
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
        AuthenticationManager.getStore().dispatch(Actions.setSignedInProfile(profile))
        AuthenticationManager.updateProfileStatus(profile)
        AjaxRequest.setup(AuthenticationManager.getAuthenticationToken())
    }
    static signOut()
    {
        let store = AuthenticationManager.getStore();

        // Remove the keepAlive (last_seen) timer
        clearInterval(AuthenticationManager.keepAlive);
        AuthenticationManager.keepAlive = null;

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
    }
    private static getStore = ():Store<RootState,any> =>
    {
        return window.store
    }
    private static updateProfileStatus = (profile:UserProfile|null) =>
    {
        if (profile) {
            AuthenticationManager.resetUserActivityCounter();
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