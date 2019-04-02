import { combineReducers } from 'redux'
import { Community } from "../types/intrasocial_types";
export enum CommunityStoreActionTypes {
    AddCommunities = 'communitystore.add_community',
    RemoveCommunity = 'communitystore.remove_community',
    Reset = 'communitystore.reset',
}
export interface AddCommunitiesAction{
    type:string
    communities:Community[]
}
export interface RemoveCommunityAction{
    type:string
    community:number
}
export interface ResetCommunitiesAction{
    type:string
}
export const addCommunitiesAction = (communities: Community[]):AddCommunitiesAction => ({
    type: CommunityStoreActionTypes.AddCommunities,
    communities
})
export const removeCommunityAction = (community:number):RemoveCommunityAction => ({
    type: CommunityStoreActionTypes.RemoveCommunity,
    community
})
export const resetCommunitiesAction = ():ResetCommunitiesAction => ({
    type: CommunityStoreActionTypes.Reset,
})
​const resetCommunities = (state, action:ResetCommunitiesAction) => {
    
    return {};
}
​​const resetCommunityIds = (state, action:ResetCommunitiesAction) => {
    
    return []
}
const addCommunities = (state, action:AddCommunitiesAction) => {
    let communities = action.communities
    let newState = {  ...state }
    communities.forEach(c => {
        let id = c.id
        let old = state[id]
        if(!old || new Date(c.updated_at) >= new Date(old.updated_at)) // update
        {
            newState[c.id] = c
        }
    })
    return newState
}
const removeCommunity = (state, action:RemoveCommunityAction) => {
    
    let newState = {  ...state }
    delete newState[action.community]
    return newState
}
const addCommunityIds = (state:number[], action:AddCommunitiesAction) => {
    
    let communities = action.communities
    let newState = [...state]
    communities.forEach(c => {
        let id = c.id
        if(state.indexOf(id) == -1)
        {
            newState.push(id)
        }
    })
    return newState
}
const removeCommunityId = (state, action:RemoveCommunityAction) => {
    return [...state].filter(i => i != action.community)
}
export const communitiesById = (state = {}, action:ResetCommunitiesAction & AddCommunitiesAction & RemoveCommunityAction) => 
{
    switch(action.type) {
        case CommunityStoreActionTypes.AddCommunities: return addCommunities(state, action);
        case CommunityStoreActionTypes.RemoveCommunity: return removeCommunity(state, action)
        case CommunityStoreActionTypes.Reset: return resetCommunities(state, action)
        default : return state;
    }
}
export const allCommunities = (state:number[] = [], action) => 
{
    switch(action.type) {
        case CommunityStoreActionTypes.AddCommunities: return addCommunityIds(state, action)
        case CommunityStoreActionTypes.RemoveCommunity: return removeCommunityId(state, action)
        case CommunityStoreActionTypes.Reset: return resetCommunityIds(state, action)
        default : return state;
    }
}
export const communityStore = combineReducers({
    byId : communitiesById,
    allIds : allCommunities
})