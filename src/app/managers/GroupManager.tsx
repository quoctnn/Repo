import {  Store } from 'redux';
import { Group } from '../types/intrasocial_types';
import ApiClient from '../network/ApiClient';
import { ReduxState } from '../redux';
import { addGroupsAction } from '../redux/groupStore';
export abstract class GroupManager
{
    static setup = () => 
    {
    }
    static storeGroups = (groups:Group[]) => {
        GroupManager.getStore().dispatch(addGroupsAction(groups))
    }
    static getGroup = (groupId:string):Group|null => 
    {
        const groupStore = GroupManager.getStore().getState().groupStore
        const isNumber = groupId.isNumber()
        var groupKey = groupStore.allIds.find(gid =>  {
            const group =  groupStore.byId[gid]
            return group.slug == groupId
        })
        if(groupKey)
        {
            return groupStore.byId[groupKey]
        }
        if(isNumber)
        {
            return groupStore.byId[groupId]
        }
        return null
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
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store 
    }
}