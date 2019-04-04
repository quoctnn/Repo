import storage from 'redux-persist/lib/storage'
import { persistReducer } from "redux-persist";
import { UserProfile } from '../types/intrasocial_types';
import { nullOrUndefined } from '../utilities/Utilities';
export enum AuthenticationActionTypes {
    SetSignedInToken = 'authentication.set_signed_in_token',
    SetSignedInProfile = 'authentication.set_signed_in_profile',
}
export interface AuthenticationData {
    token: string
    profile: UserProfile
    signedIn:boolean
}
export interface SetAuthenticationTokenAction{
    type:string
    token:string
}
export interface SetAuthenticationProfileAction{
    type:string
    profile:UserProfile,
}
const INITIAL_STATE:AuthenticationData = {
    token:null, 
    profile:null,
    signedIn:false,
}
export const setAuthenticationTokenAction = (token:string):SetAuthenticationTokenAction => ({
    type: AuthenticationActionTypes.SetSignedInToken,
    token
})
export const setAuthenticationProfileAction = (profile:UserProfile):SetAuthenticationProfileAction => ({
    type: AuthenticationActionTypes.SetSignedInProfile,
    profile,
})
const authentication = (state = INITIAL_STATE, action:SetAuthenticationTokenAction & SetAuthenticationProfileAction):AuthenticationData => {
    switch(action.type) 
    {
        case AuthenticationActionTypes.SetSignedInToken:
            return { ...state, token:action.token}
        case AuthenticationActionTypes.SetSignedInProfile:
            return { ...state, profile:action.profile, signedIn: !nullOrUndefined( action.profile) && !action.profile.is_anonymous}
        default:
            return state;
    }
}
const persistConfig = {
    key: "authentication",
    storage: storage,
    blacklist: ["signedIn"]
  };
export default persistReducer(persistConfig, authentication)