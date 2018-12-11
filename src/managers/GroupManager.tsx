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
    static storeCommunities = (groups:Group[]) => {
        GroupManager.getStore().dispatch(Actions.storeGroups(groups))
    }
    static getGroup = (groupId:number):Group|null => 
    {
        return GroupManager.getStore().getState().groupStore.groups.find(c => c.id == groupId)
    }
    static getCommunitySecure = (communityId:number, completion:(group:Group) => void) => 
    {
        return GroupManager.ensureGroupExists(communityId, completion)
    }
    static ensureGroupExists = (groupId:number, completion:(group:Group) => void) => 
    {
        let group = GroupManager.getGroup(groupId)
        if(!group)
        {
            ApiClient.getGroup(groupId, (data, status, error) => {
                if(data)
                {
                    GroupManager.storeCommunities([data])
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