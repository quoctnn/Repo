import {  Store } from 'redux';
import { ReduxState } from '../redux'; 
import { ContextGroup, ContextNaturalKey } from '../types/intrasocial_types';
import { ProfileManager } from '../managers/ProfileManager';
import { userAvatar, communityAvatar, userFullName } from '../utilities/Utilities';
import { GroupManager } from '../managers/GroupManager';
import { CommunityManager } from '../managers/CommunityManager';
export abstract class ContextManager
{
    static setup = () => 
    {
    }
    static search = (query:string, contextNaturalKey:ContextNaturalKey, completion:(result:ContextGroup[]) => void) => {
        const maxGroupItems = 5
        let r:ContextGroup[] = []
        if(!contextNaturalKey || contextNaturalKey == ContextNaturalKey.USER)
        {
            r.push({
                type:ContextNaturalKey.USER, 
                items:ProfileManager.searchProfiles(query, null, maxGroupItems).map(u => { return {id:u.id, label:userFullName(u), type:ContextNaturalKey.USER, image:userAvatar(u, true)} })
                })
        }
        if(!contextNaturalKey || contextNaturalKey == ContextNaturalKey.GROUP)
        {
            r.push({
                type:ContextNaturalKey.GROUP, 
                items:GroupManager.searchGroups(query, null, maxGroupItems).map(g => { return {id:g.id, label:g.name, type:ContextNaturalKey.GROUP, image:null} })
                })
        }
        if(!contextNaturalKey || contextNaturalKey == ContextNaturalKey.COMMUNITY)
        {
            r.push({
                type:ContextNaturalKey.COMMUNITY, 
                items:CommunityManager.searchCommunities(query, maxGroupItems).map(c => { return {id:c.id, label:c.name, type:ContextNaturalKey.COMMUNITY, image:communityAvatar(c, true)} })
                })
        }
        completion(r)
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store 
    }
}