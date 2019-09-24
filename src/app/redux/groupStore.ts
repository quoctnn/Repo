import { combineReducers } from 'redux'
import { Group } from "../types/intrasocial_types";
import { shallowCompareFields } from '../utilities/Utilities';
export enum GroupStoreActionTypes {
    AddGroups = 'groupstore.add_groups',
    Reset = 'groupstore.reset',
}
export interface AddGroupsAction{
    type:string
    groups:Group[]
    force?:boolean
}
export interface ResetGroupsAction{
    type:string
}
export const addGroupsAction = (groups: Group[]):AddGroupsAction => ({
    type: GroupStoreActionTypes.AddGroups,
    groups
})
export const resetGroupsAction = ():ResetGroupsAction => ({
    type: GroupStoreActionTypes.Reset,
})
​const resetGroups = (state, action:ResetGroupsAction) => {
    
    return {};
}
​​const resetGroupIds = (state, action:ResetGroupsAction) => {
    
    return []
}
const shouldUpdate = (oldGroup:Group, newGroup:Group) => {
    if(!oldGroup)
        return true
    const fieldsUpdated = !shallowCompareFields(["avatar", "cover", "slug"], oldGroup, newGroup)
    if(fieldsUpdated)
    {
        return true
    }
    return new Date(newGroup.updated_at).getTime() > new Date(oldGroup.updated_at).getTime()
}
const addGroups = (state, action:AddGroupsAction) => {
    let groups = action.groups
    let newState = {  ...state }
    groups.forEach(c => {
        let id = c.id
        let old = state[id]
        if(action.force || shouldUpdate(old, c)) // update
        {
            newState[c.id] = c
        }
    })
    return newState
}
const addGroupIds = (state:number[], action:AddGroupsAction) => {
    
    let groups = action.groups
    let newState = [...state]
    groups.forEach(c => {
        let id = c.id
        if(state.indexOf(id) == -1)
        {
            newState.push(id)
        }
    })
    return newState
}
export const groupsById = (state = {}, action:ResetGroupsAction & AddGroupsAction ) => 
{
    switch(action.type) {
        case GroupStoreActionTypes.AddGroups: return addGroups(state, action);
        case GroupStoreActionTypes.Reset: return resetGroups(state, action)
        default : return state;
    }
}
export const allGroups = (state:number[] = [], action) => 
{
    switch(action.type) {
        case GroupStoreActionTypes.AddGroups: return addGroupIds(state, action)
        case GroupStoreActionTypes.Reset: return resetGroupIds(state, action)
        default : return state;
    }
}
export const groupStore = combineReducers({
    byId : groupsById,
    allIds : allGroups
})