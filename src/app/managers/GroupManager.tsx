import {  Store } from 'redux';
import { Group } from '../types/intrasocial_types';
import {ApiClient} from '../network/ApiClient';
import { ReduxState } from '../redux';
import { addGroupsAction } from '../redux/groupStore';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventStreamMessageType } from '../network/ChannelEventStream';
export abstract class GroupManager
{
    static setup = () =>
    {
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.GROUP_NEW, GroupManager.processGroupNew)
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.GROUP_UPDATE, GroupManager.processGroupUpdate)
    }
    static processGroupNew = (...args:any[]) => {
        const groupId = args[0]["group_id"] as number
        GroupManager.updateGroup(groupId)
    }
    static processGroupUpdate = (...args:any[]) => {
        const groupId = args[0]["group_id"] as number
        GroupManager.updateGroup(groupId)
    }
    static updateGroup = (groupId:number) => (
        ApiClient.getGroup(groupId.toString(), (data, status, error) => {
            if(data)
            {
                GroupManager.storeGroups([data])
            }
        })
    )
    static storeGroups = (groups:Group[]) => {
        GroupManager.getStore().dispatch(addGroupsAction(groups))
    }
    static getGroupById = (groupId:number):Group|null =>
    {
        return GroupManager.getStore().getState().groupStore.byId[groupId]
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
    static searchGroups = ( query:string, communityId?:number, maxItems?:number) =>
    {
        var searchables:number[] = []
        const store = GroupManager.getStore().getState().groupStore
        if(communityId)
        {
            searchables = GroupManager.getGroups(store.allIds).filter(g => g.community == communityId).map(g => g.id)
        }
        else
        {
            searchables = store.allIds
        }
        const result = GroupManager.searchGroupIds(query, searchables)
        if(maxItems)
            return result.slice(0, maxItems)
        return result
    }
    static searchGroupIds = ( query:string, groupIds:number[]) =>
    {
        let groups = GroupManager.getGroups(groupIds || [])
        return groups.filter(g => GroupManager.filterGroup(query,g!))
    }
    static getGroups = (groupIds:number[]) =>
    {
        let store = GroupManager.getStore().getState().groupStore
        let groups = groupIds.map(p =>{
            return store.byId[p]
        }).filter(u => u != null)
        return groups
    }
    private static filterGroup = (query:string, group:Group) =>
    {
        let compareString = group.name
        return compareString.toLowerCase().indexOf(query.toLowerCase()) > -1
    }
    static ensureGroupExists = (groupId:string|number, completion:(group:Group) => void, forceUpdate?: boolean) =>
    {
        const id = groupId.toString()
        let group = GroupManager.getGroup(id)
        if(!group || forceUpdate)
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