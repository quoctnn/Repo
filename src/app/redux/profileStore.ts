import { combineReducers } from 'redux'
import { UserProfile } from "../types/intrasocial_types";
export enum ProfileStoreActionTypes {
    AddProfiles = 'profilestore.add_profiles',
    Reset = 'profilestore.reset',
}
export interface AddProfilesAction{
    type:string
    profiles:UserProfile[]
    force?:boolean
}
export interface ResetProfilesAction{
    type:string
}
export const addProfilesAction = (profiles: UserProfile[], force?:boolean):AddProfilesAction => ({
    type: ProfileStoreActionTypes.AddProfiles,
    profiles,
    force
})
export const resetProfilesAction = ():ResetProfilesAction => ({
    type: ProfileStoreActionTypes.Reset,
})
​const resetProfiles = (state, action:ResetProfilesAction) => {
    
    return {};
}
​​const resetProfileIds = (state, action:ResetProfilesAction) => {
    
    return []
}
const addProfiles = (state, action:AddProfilesAction) => {
    let profiles = action.profiles
    let newState = {  ...state }
    profiles.forEach(p => {
        let id = p.id
        let old:UserProfile = state[id]
        if(action.force || !old || old.unresolved_time || !old.last_seen || !p.last_seen || new Date(old.last_seen).getTime() < new Date(p.last_seen).getTime()) // update
        {
            newState[p.id] = p
        }
    })
    return newState
}
const addProfileIds = (state:number[], action:AddProfilesAction) => {
    
    let profiles = action.profiles
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
export const profilesById = (state = {}, action:ResetProfilesAction & AddProfilesAction ) => 
{
    switch(action.type) {
        case ProfileStoreActionTypes.AddProfiles: return addProfiles(state, action);
        case ProfileStoreActionTypes.Reset: return resetProfiles(state, action)
        default : return state;
    }
}
export const allProfiles = (state:number[] = [], action) => 
{
    switch(action.type) {
        case ProfileStoreActionTypes.AddProfiles: return addProfileIds(state, action)
        case ProfileStoreActionTypes.Reset: return resetProfileIds(state, action)
        default : return state;
    }
}
export const profileStore = combineReducers({
    byId : profilesById,
    allIds : allProfiles
})