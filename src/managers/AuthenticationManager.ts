import {  Store } from 'redux';
import * as Actions from '../actions/Actions';
import { RootState } from '../reducers';
import { AjaxRequest } from '../network/AjaxRequest';
import { UserProfile } from '../types/intrasocial_types';
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
        AjaxRequest.setup(AuthenticationManager.getAuthenticationToken())
        AuthenticationManager.getStore().dispatch(Actions.setSignedInProfile(profile))
        AuthenticationManager.updateProfileStatus(profile)
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