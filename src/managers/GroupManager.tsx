import {  Store } from 'redux';
import { RootState } from '../reducers';
import * as Actions from '../actions/Actions';
import { Group } from '../types/intrasocial_types';
import ApiClient from '../network/ApiClient';
export abstract class GroupManager
{
    static setup = () => 
    {
    }
    static storeGroups = (groups:Group[]) => {
        GroupManager.getStore().dispatch(Actions.storeGroups(groups))
    }
    static getGroup = (groupId:string):Group|null => 
    {
        const isNumber = groupId.isNumber()
        var group = GroupManager.getStore().getState().groupStore.groups.find(g => g.slug == groupId)
        if(!group && isNumber)
        {
            return GroupManager.getStore().getState().groupStore.groups.find(g => g.id == parseInt(groupId))
        }
        return group
    }
    static ensureGroupExists = (groupId:string|number, completion:(group:Group) => void) => 
    {
        const id = groupId.toString()
        let group = GroupManager.getGroup(id)
        if(!group)
        {
            ApiClient.getGroup(id, (data, status, error) => {
                if(data)
                {
                    GroupManager.storeGroups([data])
                }
                else 
                {
                    console.log("error fetching group", error)
                }
                completion(data)
            })
        }
        else 
        {
            completion(group)
        }

    }
    private static getStore = ():Store<RootState,any> =>
    {
        return window.store 
    }
}