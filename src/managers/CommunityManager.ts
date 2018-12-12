import {  Store } from 'redux';
import { RootState } from '../reducers';
import * as Actions from '../actions/Actions';
import { Community } from '../types/intrasocial_types';
import ApiClient from '../network/ApiClient';
export abstract class CommunityManager
{
    static setup = () => 
    {
    }
    static storeCommunities = (communities:Community[]) => {
        CommunityManager.getStore().dispatch(Actions.storeCommunities(communities))
    }
    static getCommunity = (communityId:string):Community|null => 
    {
        const isNumber = communityId.isNumber()
        var community = CommunityManager.getStore().getState().communityStore.communities.find(c => c.slug_name == communityId)
        if(!community && isNumber)
        {
            return CommunityManager.getStore().getState().communityStore.communities.find(c => c.id == parseInt(communityId))
        }
        return community
    }
    static getCommunityById = (communityId:number):Community|null => 
    {
        return CommunityManager.getStore().getState().communityStore.communities.find(c => c.id == communityId)
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
    private static getStore = ():Store<RootState,any> =>
    {
        return window.store 
    }
}