import {Types} from "../utilities/Types"
import { Group } from '../reducers/groupStore';
import { Community } from '../reducers/communityStore';
import { UserProfile } from '../reducers/profileStore';
//profileStore
export const storeProfiles = (profiles:UserProfile[]) => ({
    type: Types.PROFILESTORE_ADD_PROFILES,
    profiles: profiles,
})
export const storeProfile = (profile:UserProfile) => ({
    type: Types.PROFILESTORE_ADD_PROFILE,
    profile: profile,
})
export const resetProfileStore = () => ({
    type: Types.PROFILESTORE_RESET,
})

//communityStore
export const storeCommunities = (communities:Community[]) => ({
    type: Types.COMMUNITYSTORE_ADD_COMMUNITIES,
    communities: communities,
})
export const storeCommunity = (community:Community) => ({
    type: Types.COMMUNITYSTORE_ADD_COMMUNITY,
    community: community,
})
export const resetCommunityStore = () => ({
    type: Types.COMMUNITYSTORE_RESET,
})

//groupStore
export const storeGroups = (groups:Group[]) => ({
    type: Types.GROUPSTORE_ADD_GROUPS,
    groups: groups,
})
export const storeGroup = (group:Group) => ({
    type: Types.GROUPSTORE_ADD_GROUP,
    group: group,
})
export const resetGroupStore = () => ({
    type: Types.GROUPSTORE_RESET,
})

//contactListCache
export const setContactListCache = (contacts:number[]) => ({
    type: Types.SET_CONTACT_LIST_CACHE,
    contacts: contacts,
})
export const appendContactListCache = (contacts:number[]) => ({
    type: Types.APPEND_CONTACT_LIST_CACHE,
    contacts: contacts,
})
export const resetContactListCache = () => ({
    type: Types.RESET_CONTACT_LIST_CACHE,
})

//groupListCache
export const setCommunityGroupsCache = (community:number, groups:number[], total:number) => ({
    type: Types.SET_COMMUNITY_GROUPS_CACHE,
    groups: groups,
    community:community,
    total:total
})
export const appendCommunityGroupsCache = (community:number, groups:number[]) => ({
    type: Types.APPEND_COMMUNITY_GROUPS_CACHE,
    groups: groups,
    community:community
})
export const resetCommunityGroupsCache = () => ({
    type: Types.RESET_COMMUNITY_GROUPS_CACHE,
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
export const setAwayTimeout = (timeout:number) => ({
    type: Types.SET_AWAY_TIMEOUT,
    timeout: timeout
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