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
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store 
    }
}