import { UserProfile } from '../reducers/contacts';
import {Types} from "../utilities/Types"


//contacts
export const setContacts = (contacts:UserProfile[]) => ({
    type: Types.SET_CONTACTS,
    contacts: contacts
})
export const updateContact = (user:UserProfile) => ({
    type: Types.UPDATE_CONTACT,
    user: user
})

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
    profile: UserProfile
}

export type SetProfileAction = (profile:UserProfile) => UpdateProfileAction;
export const setProfile:SetProfileAction = (profile:UserProfile) => ({
    type: Types.SET_PROFILE,
    profile: profile
})