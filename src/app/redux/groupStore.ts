import { combineReducers } from 'redux'
import { Group } from "../types/intrasocial_types";
import { shallowCompareFields } from '../utilities/Utilities';
export enum GroupStoreActionTypes {
    AddGroups = 'groupstore.add_groups',
    UpdateGroup = 'groupstore.update_group',
    RemoveGroup = 'groupstore.remove_group',
    Reset = 'groupstore.reset',
}
export interface AddGroupsAction{
    type:string
    groups:Group[]
    force?:boolean
}
export interface RemoveGroupAction{
    type:string
    group:number
}
export interface ResetGroupsAction{
    type:string
}
export const addGroupsAction = (groups: Group[]):AddGroupsAction => ({
    type: GroupStoreActionTypes.AddGroups,
    groups
})
export const removeGroupAction = (group: number):RemoveGroupAction => ({
    type: GroupStoreActionTypes.RemoveGroup,
    group
})
export const updateGroupAction = (group: Partial<Group>):AddGroupsAction => ({
    type: GroupStoreActionTypes.UpdateGroup,
    groups:[group as Group]
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
    const fieldsUpdated = !shallowCompareFields(["avatar", "cover_cropped", "slug", "members", "invited", "pending"], oldGroup, newGroup)
    if(fieldsUpdated)
    {
        return true
    }
    return new Date(newGroup.updated_at).getTime() > new Date(oldGroup.updated_at).getTime()
}
const updateGroup = (state, action:AddGroupsAction) => {
    const newObject = action.groups[0] || {} as Partial<Group>
    const id = newObject.id
    if(!id)
        return state
    const oldObject = state[id]
    if(!oldObject)
        return state
    let newState = {  ...state }
    const updatedObject = Object.assign({...oldObject}, newObject)
    newState[id] = updatedObject
    return newState
}
const removeGroup = (state:Object, action:RemoveGroupAction) => {
    const group = action.group
    if(state.hasOwnProperty(group))
    {
        const newState = {  ...state }
        delete newState[group]
        return newState
    }
    return state
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
const removeGroupId = (state:number[], action:RemoveGroupAction) => {
    
    const group = action.group
    const st = [...state]
    st.remove(group)
    return st
}
export const groupsById = (state = {}, action:ResetGroupsAction & AddGroupsAction & RemoveGroupAction) => 
{
    switch(action.type) {
        case GroupStoreActionTypes.AddGroups: return addGroups(state, action);
        case GroupStoreActionTypes.UpdateGroup: return updateGroup(state, action);
        case GroupStoreActionTypes.RemoveGroup: return removeGroup(state, action)
        case GroupStoreActionTypes.Reset: return resetGroups(state, action)
        default : return state;
    }
}
export const allGroups = (state:number[] = [], action) => 
{
    switch(action.type) {
        case GroupStoreActionTypes.AddGroups: return addGroupIds(state, action)
        case GroupStoreActionTypes.RemoveGroup: return removeGroupId(state, action)
        case GroupStoreActionTypes.Reset: return resetGroupIds(state, action)
        default : return state;
    }
}
export const groupStore = combineReducers({
    byId : groupsById,
    allIds : allGroups
})