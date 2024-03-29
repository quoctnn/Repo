import {  Store } from 'redux';
import { Community, IdentifiableObject } from '../types/intrasocial_types';
import {ApiClient} from '../network/ApiClient';
import { ReduxState } from '../redux';
import { addCommunitiesAction, removeCommunityAction, updateCommunityAction } from '../redux/communityStore';
import { setActiveCommunityAction } from '../redux/activeCommunity';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventStreamMessageType } from '../network/ChannelEventStream';
import { ToastManager } from './ToastManager';
import { translate } from '../localization/AutoIntlProvider';
import Routes from "../utilities/Routes";
export abstract class CommunityManager
{
    static setup = () =>
    {
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.COMMUNITY_UPDATE, CommunityManager.processCommunityUpdate)
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.COMMUNITY_DELETE, CommunityManager.processCommunityDelete)
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.COMMUNITY_MAIN, CommunityManager.processCommunityMainChanged)
    }
    static processCommunityDelete = (...args:any[]) => {
        let communityId = args[0]["id"] as number;
        CommunityManager.removeCommunity(communityId)
    }
    static processCommunityMainChanged = (...args:any[]) => {
        let communityId = args[0]["id"] as number;
        const community = CommunityManager.getCommunityById(communityId)
        ToastManager.showInfoToast(translate("Main community changed"), community.name)
    }
    static updateCommunityObject = (community:Partial<Community> & IdentifiableObject) => {
        CommunityManager.getStore().dispatch(updateCommunityAction(community))
    }
    static processCommunityUpdate = (...args:any[]) => {
        let communityId = args[0]["id"] as number;
        ApiClient.getCommunity(communityId, (community, status, error) => {
            if(community)
            {
                const hasCommunity = !!CommunityManager.getCommunityById(communityId)
                CommunityManager.storeCommunities([community], true)
                if(!hasCommunity)
                {
                    ToastManager.showInfoToast(translate("community.incoming.new").format(community.name), null, Routes.communityUrl(community.slug_name))
                }
            }
        })
    }
    static applyCommunityThemeIfNeeded = (updatedCommunities:Community[]) => {
        if(updatedCommunities && updatedCommunities.length > 0)
        {
            const activeCommunity = CommunityManager.getActiveCommunity()
            if(activeCommunity && updatedCommunities.map(i => i.id).contains(activeCommunity.id))
            {
                CommunityManager.applyCommunityTheme(activeCommunity)
            }
        }
    }
    static storeCommunities = (communities:Community[], force?:boolean) => {
        if(communities.length > 0)
        {
            CommunityManager.getStore().dispatch(addCommunitiesAction(communities, force))
        }
    }
    static removeCommunity = (communityId:number) => {
        const activeCommunity = CommunityManager.getActiveCommunity()
        CommunityManager.getStore().dispatch(removeCommunityAction(communityId))
        if(activeCommunity && activeCommunity.id == communityId)
        {
            CommunityManager.setInitialCommunity()
        }
    }
    static getCommunity = (communityId:string):Community|null =>
    {
        const communityStore = CommunityManager.getStore().getState().communityStore
        if (communityId) {
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
        }
        return null
    }
    static getCommunityById = (communityId:number):Community|null =>
    {
        return CommunityManager.getStore().getState().communityStore.byId[communityId]
    }
    static ensureExists = (communityId:string|number, forceUpdate?: boolean) =>
    {
        const id = communityId.toString()
        let community = CommunityManager.getCommunity(id)
        if(!community || forceUpdate)
        {
            ApiClient.getCommunity(id, (data, status, error) => {
                if(data)
                {
                    CommunityManager.storeCommunities([data])
                }
                else
                {
                    console.error("error fetching community", error)
                }
            })
        }
        return community

    }
    static ensureCommunityExists = (communityId:string|number, completion?:(community:Community) => void, forceUpdate?: boolean) =>
    {
        const id = communityId.toString()
        let community = CommunityManager.getCommunity(id)
        if(!community || forceUpdate)
        {
            ApiClient.getCommunity(id, (data, status, error) => {
                if(data)
                {
                    CommunityManager.storeCommunities([data])
                }
                else
                {
                    console.error("error fetching community", error)
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
        let root = document.querySelector(':root') as HTMLElement
        if(root) {
            if(community){
                console.warn("Applying theme for community", community.name)
                root.style.setProperty("--primary-theme-color",community.primary_color)
                root.style.setProperty("--secondary-theme-color",community.secondary_color)
            }
            else {
                console.warn("Removing community theme")
                root.style.removeProperty("--primary-theme-color")
                root.style.removeProperty("--secondary-theme-color")
            }
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