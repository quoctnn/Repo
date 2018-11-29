import {  Store } from 'redux';
import { UserProfile } from '../reducers/profileStore';
import * as Actions from '../actions/Actions';
import { RootState } from '../reducers';
import { AjaxRequest } from '../network/AjaxRequest';
export abstract class AuthenticationManager
{
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
        AuthenticationManager.getStore().dispatch(Actions.setSignedIn(null))
    }
    private static getStore = ():Store<RootState,any> =>
    {
        return window.store 
    }
    private static updateProfileStatus = (profile:UserProfile|null) => 
    {

    }
}