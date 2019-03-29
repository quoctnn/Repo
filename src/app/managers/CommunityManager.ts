import {  Store } from 'redux';
import { Community } from '../types/intrasocial_types';
import ApiClient from '../network/ApiClient';
import { ReduxState } from '../redux';
import { addCommunitiesAction } from '../redux/communityStore';
import { setActiveCommunityAction } from '../redux/activeCommunity';
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
    static ensureCommunityExists = (communityId:string|number, completion?:(community:Community) => void) => 
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
                completion && completion(data)
            })
        }
        else 
        {
            completion && completion(community)
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
        return communities.filter(c => CommunityManager.filterCommunity(query,c!))
    }
    static getCommunities = (communityIds:number[]) =>
    {
        let store = CommunityManager.getStore().getState().communityStore
        let communities = communityIds.map(p =>{
            return store.byId[p]
        }).filter(u => u != null)
        return communities
    }
    static setInitialCommunity = (communityId?:number) => {
        console.log("setInitialCommunity")
        const state = CommunityManager.getStore().getState()
        const currentActiveCommunityId = state.activeCommunity.activeCommunity
        if(communityId)
        {
            const community = CommunityManager.getCommunityById(communityId)
            if(community && communityId != currentActiveCommunityId)
            {
                CommunityManager.setActiveCommunity(communityId)
                return
            }
        } 
        //fallback current active community
        const currentActiveCommunity = CommunityManager.getCommunityById(currentActiveCommunityId)
        if(currentActiveCommunity)
        {
            return
        }
        //fallback first community
        const communityIds = state.communityStore.allIds
        const active = communityIds[0]
        if(active)
            CommunityManager.setActiveCommunity(active)
        else 
            console.error("NO COMMUNITY AVAILABLE")
    }
    static getActiveCommunity = () => {
        const state = CommunityManager.getStore().getState()
        return state.communityStore.byId[state.activeCommunity.activeCommunity]
    }
    static applyCommunityTheme = (community:Community) =>
    {
        if(!community)
            return
        console.warn("Applying theme for community", community.name)
        let root = document.querySelector(':root') as HTMLElement
        if(root) {
            root.style.setProperty("--primary-theme-color",community.primary_color)
            root.style.setProperty("--secondary-theme-color",community.secondary_color)
        }
    }
    private static setActiveCommunity = (community:number) =>
    {
        CommunityManager.getStore().dispatch(setActiveCommunityAction(community))
    }
    private static filterCommunity = (query:string, community:Community) =>
    {
        let compareString = community.name
        return compareString.toLowerCase().indexOf(query.toLowerCase()) > -1
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store 
    }
}