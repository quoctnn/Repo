import {Types} from "../utilities/Types"
import profile from '../reducers/profile';

//debug
export const setApiEndpoint = (index:number) => ({
    type: Types.SET_API_ENDPOINT,
    apiEndpoint: index
})
export const setAccessTokenOverride = (accessToken:string) => ({
    type: Types.SET_ACCESS_TOKEN_OVERRIDE,
    accessToken: accessToken
})
export const setAuthorizationData = (token:string, sessionid:string) => ({
    type: Types.SET_AUTORIZATION_DATA,
    token: token,
    sessionid: sessionid
})

//settings
export const setLanguage = (index:number) => ({
    type: Types.SET_LANGUAGE,
    language: index
})
export const setSignedIn = (signedIn:boolean) => ({
    type: Types.SET_SIGNED_IN,
    signedIn: signedIn
})
//profile

export interface UpdateProfileAction {
    type: Types,
    profile: any
}
export type SetProfileAction = (profile:any) => UpdateProfileAction;
export const setProfile:SetProfileAction = (profile:any) => ({
    type: Types.SET_PROFILE,
    profile: profile
})