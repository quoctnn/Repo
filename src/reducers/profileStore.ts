import {Types} from "../utilities/Types"
import { AvatarStateColor } from '../components/general/Avatar';
import { combineReducers } from 'redux'
import { RootState } from './index';

export interface UserProfile {
    absolute_url: string,
    avatar: string,
    avatar_thumbnail: string,
    cover: string,
    cover_cropped: string,
    first_name: string,
    id: number,
    last_name: string,
    relationship: string[],
    username: string,
    uuid:string,
    user_status:UserStatus,
    biography:string, 
    last_seen:number,
    slug_name:string,
    updated_at:string
}
export enum UserStatus
{
    USER_ACTIVE = "active",//green
    USER_AWAY = "away", //orange
    USER_UNAVAILABLE = "unavailable", //nothing
    USER_DO_NOT_DISTURB = "dnd", //red
    USER_VACATION = "vacation",//gray
    USER_INVISIBLE = "invisible"//nothing
}
export const avatarStateColorForUserProfile = (userProfile:UserProfile) => {
    switch(userProfile.user_status)
    {
        case UserStatus.USER_ACTIVE: return AvatarStateColor.GREEN;
        case UserStatus.USER_AWAY: return AvatarStateColor.ORANGE;
        case UserStatus.USER_DO_NOT_DISTURB: return AvatarStateColor.RED;
        case UserStatus.USER_VACATION: return AvatarStateColor.GRAY;
        default: return AvatarStateColor.NONE
    }
}
const addProfiles = (state, action) => {
    let profiles = action.profiles as UserProfile[]
    let newState = {  ...state }
    profiles.forEach(p => {
        let id = p.id
        let oldProfile = state[id]
        if(!oldProfile || new Date(oldProfile.updated_at) < new Date(p.updated_at)) // update
        {
            newState[p.id] = p
        }
    })
    return newState
}
const addProfile = (state, action) => {
    
    let profile = action.profile as UserProfile
    let id = profile.id
    let oldProfile = state[id]
    if(!oldProfile || new Date(oldProfile.updated_at) < new Date(profile.updated_at)) // update
    {
        return {
            ...state,
            [profile.id] : profile
        };
    }
    return state
}
​const resetProfiles = (state, action) => {
    
    return {};
}
export const profilesById = (state = {}, action) => 
{
    switch(action.type) {
        case Types.PROFILESTORE_ADD_PROFILES: return addProfiles(state, action);
        case Types.PROFILESTORE_ADD_PROFILE : return addProfile(state, action);
        case Types.PROFILESTORE_RESET: return resetProfiles(state, action)
        default : return state;
    }
}
///////////////////////
const addProfileIds = (state:number[], action) => {
    
    let profiles = action.profiles as UserProfile[]
    let newState = [...state]
    profiles.forEach(p => {
        let id = p.id
        if(state.indexOf(id) == -1)
        {
            newState.push(id)
        }
    })
    return newState
}
const addProfileId = (state:number[], action) => {
    
    let id = action.profile.id
    if(state.indexOf(id) == -1)
    {
        return [...state, id]
    }
    return state
}
​​const resetProfileIds = (state, action) => {
    
    return []
}
export const allProfiles = (state:number[] = [], action) => 
{
    switch(action.type) {
        case Types.PROFILESTORE_ADD_PROFILES: return addProfileIds(state, action);
        case Types.PROFILESTORE_ADD_PROFILE : return addProfileId(state, action);
        case Types.PROFILESTORE_RESET: return resetProfileIds(state, action)
        default : return state;
    }
}
​
export const profileStore = combineReducers({
    byId : profilesById,
    allIds : allProfiles
});

export const getProfileIdBySlugName = (slug:string, state:RootState) => 
{
    let ids = state.profileStore.allIds
    return ids.find((k) => 
    {
        let p = state.profileStore.byId[k] as UserProfile
        return p.slug_name == slug
    })
}