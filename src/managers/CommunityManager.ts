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
    static getCommunity = (communityId:number):Community|null => 
    {
        return CommunityManager.getStore().getState().communityStore.communities.find(c => c.id == communityId)
    }
    static getCommunitySecure = (communityId:number, completion:(community:Community) => void) => 
    {
        return CommunityManager.ensureCommunityExists(communityId, completion)
    }
    static ensureCommunityExists = (communityId:number, completion:(community:Community) => void) => 
    {
        let community = CommunityManager.getCommunity(communityId)
        if(!community)
        {
            ApiClient.getCommunity(communityId, (data, status, error) => {
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