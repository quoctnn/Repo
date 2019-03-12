import {  Store } from 'redux';
import { Community } from '../types/intrasocial_types';
import ApiClient from '../network/ApiClient';
import { ReduxState } from '../redux';
import { addCommunitiesAction } from '../redux/communityStore';
export abstract class CommunityManager
{
    static setup = () => 
    {
    }
    static storeCommunities = (communities:Community[]) => {
        if(communities.length > 0)
            CommunityManager.getStore().dispatch(addCommunitiesAction(communities))
    }
    static getCommunity = (communityId:string):Community|null => 
    {
        const communityStore = CommunityManager.getStore().getState().communityStore
        const isNumber = communityId.isNumber()
        var communityKey = communityStore.allIds.find(cid =>  {
            const comm =  communityStore.byId[cid]
            return comm.slug_name == communityId
        })
        if(communityKey)
        {
            return communityStore.byId[communityKey]
        }
        if(isNumber)
        {
            return CommunityManager.getCommunityById(parseInt(communityId))
        }
        return null
    }
    static getCommunityById = (communityId:number):Community|null => 
    {
        return CommunityManager.getStore().getState().communityStore.byId[communityId]
    }
    static ensureCommunityExists = (communityId:string|number, completion:(community:Community) => void) => 
    {
        const id = communityId.toString()
        let community = CommunityManager.getCommunity(id)
        if(!community)
        {
            ApiClient.getCommunity(id, (data, status, error) => {
                if(data)
                {
                    CommunityManager.storeCommunities([data])
                }
                else 
                {
                    console.log("error fetching community", error)
                }
                completion(data)
            })
        }
        else 
        {
            completion(community)
        }

    }
    static searchCommunities = ( query:string, maxItems?:number) =>
    {
        const store = CommunityManager.getStore().getState().communityStore
        var searchables:number[] = store.allIds
        const result = CommunityManager.searchCommunityIds(query, searchables)
        if(maxItems)
            return result.slice(0, maxItems)
        return result
    }
    static searchCommunityIds = ( query:string, communityIds:number[]) =>
    {
        let communities = CommunityManager.getCommunities(communityIds || [])
        return communities.filter(c => CommunityManager.filterGroup(query,c!))
    }
    static getCommunities = (communityIds:number[]) =>
    {
        let store = CommunityManager.getStore().getState().communityStore
        let communities = communityIds.map(p =>{
            return store.byId[p]
        }).filter(u => u != null)
        return communities
    }
    private static filterGroup = (query:string, community:Community) =>
    {
        let compareString = community.name
        return compareString.toLowerCase().indexOf(query.toLowerCase()) > -1
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store 
    }
}