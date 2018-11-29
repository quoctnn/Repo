import {  Store } from 'redux';
import { RootState } from '../reducers';
import * as Actions from '../actions/Actions';
import { Community } from '../reducers/communityStore';
export abstract class CommunityManager
{
    static setup = () => 
    {
    }
    static storeCommunities = (communities:Community[]) => {
        CommunityManager.getStore().dispatch(Actions.storeCommunities(communities))
    }
    static getCommunity = (communityId:number) => 
    {
        return CommunityManager.getStore().getState().communityStore.communities.find(c => c.id == communityId)
    }
    private static getStore = ():Store<RootState,any> =>
    {
        return window.store 
    }
}