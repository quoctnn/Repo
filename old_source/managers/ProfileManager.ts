import {  Store } from 'redux';
import ApiClient from '../network/ApiClient';
import { CommunityManager } from './CommunityManager';
import * as Actions from '../actions/Actions';
import { RootState } from '../reducers';
import { UserProfile, ContextNaturalKey } from '../types/intrasocial_types2';
import { AuthenticationManager } from './AuthenticationManager';
import { GroupManager } from './GroupManager';
import { ProjectManager } from './ProjectManager';
export abstract class ProfileManager
{
    static setup = () =>
    {
    }
    static getProfile = (profileId:string):UserProfile|null => 
    {
        const state = ProfileManager.getStore().getState()
        const isNumber = profileId.isNumber()
        const me = AuthenticationManager.getAuthenticatedUser()
        if(me.slug_name == profileId)
        {
            return me
        }
        let keys = Object.keys(state.profileStore.byId)
        let profiles = [me].concat(keys.map(k => state.profileStore.byId[parseInt(k)]))
        var profile =  profiles.find(p => p.slug_name == profileId)
        if(!profile && isNumber)
        {
            const id = parseInt(profileId)
            if(me.id == id)
            {
                return me
            }
            return state.profileStore.byId[id]
        }
        return profile
    }
    static ensureProfileExists = (profileId:string|number, completion:(profile:UserProfile) => void) => 
    {
        const id = profileId.toString()
        let profile = ProfileManager.getProfile(id)
        if(!profile)
        {
            ApiClient.getProfile(id, (data, status, error) => {
                if(data)
                {
                    ProfileManager.storeProfile(data)
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
            completion(profile)
        }

    }
    static ensureProfilesExists = (profiles:number[], completion:() => void) =>
    {
        let store = ProfileManager.getStore()
        let state = store.getState()
        let ids = state.profileStore.allIds.map(id => id)
        ids.push(state.auth.profile!.id)
        let requestIds = profiles.filter(id => ids.indexOf(id) == -1)
        if(requestIds.length > 0)
        {
            ApiClient.getProfiles(requestIds, (data, status, error) => 
            {
                if(data && data.results && data.results.length > 0)
                {
                    store.dispatch(Actions.storeProfiles(data.results))
                }
                else
                {
                    console.log("error fetching profiles", error)
                }
                completion()
            })
        }
        else
        {
            completion()
        }
    }
    static getProfileByUsername = (name: string): UserProfile|null =>
    {
        let s = ProfileManager.getStore().getState();
        if (s.auth.profile && s.auth.profile.username == name)
          return s.auth.profile;
        let keys = Object.keys( s.profileStore.byId);
        let k = keys.find(k => s.profileStore.byId[k].username == name)
        if(k)
        {
          return s.profileStore.byId[k]
        }
        return null
    }
    static getProfileById = (profile:number) =>
    {
        let s = ProfileManager.getStore().getState()
        let authUser = s.auth.profile!
        if(authUser!.id == profile)
            return authUser
        return s.profileStore.byId[profile]
    }
    static getProfiles = (profiles:number[]) =>
    {
        let s = ProfileManager.getStore().getState()
        let authUser = s.auth.profile!
        let userProfiles = profiles.map(p =>{
            if(authUser!.id == p)
                return authUser
            return s.profileStore.byId[p]
        }).filter(u => u != null)
        return userProfiles
    }
    private static filterProfile = (query:string, profile:UserProfile) =>
    {
        let compareString = profile.first_name + " " + profile.last_name
        return compareString.toLowerCase().indexOf(query.toLowerCase()) > -1
    }

    static searchProfiles = ( query:string, communityId?:number, maxItems?:number) =>
    {
        var searchables:number[] = []
        if(communityId)
        {
            let community = CommunityManager.getCommunityById(communityId)
            if(community)
            {
                searchables = community.members || []
            }
            else
            {
                //no community
            }
        }
        else
        {
            searchables = ProfileManager.getContactListIds()
        }
        if(maxItems)
            searchables.slice(0, maxItems)
        return ProfileManager.searchProfilesIds(query, searchables)
    }
    static searchProfilesIds = ( query:string, profiles:number[] = []) =>
    {
        let users = ProfileManager.getProfiles(profiles || [])
        return users.filter(u => ProfileManager.filterProfile(query,u!))
    }
    static getContactListIds = () => {
        return ProfileManager.getStore().getState().contactListCache.contacts
    }
    static storeProfiles = (profiles:UserProfile[]) => {
        ProfileManager.getStore().dispatch(Actions.storeProfiles(profiles))
    }
    static storeProfile = (profile:UserProfile) => {
        ProfileManager.getStore().dispatch(Actions.storeProfile(profile))
    }
    static setContactListCache = (contacts:number[]) => {
        ProfileManager.getStore().dispatch(Actions.setContactListCache(contacts))
    }
    static searchMembersInContext = (query:string, contextObjectId:number, contextNaturalKey:string, completion:(members:UserProfile[]) => void) => {
        switch(contextNaturalKey)
        {
            case ContextNaturalKey.COMMUNITY: 
            {
                CommunityManager.ensureCommunityExists(contextObjectId, (community) => 
                {
                    let result:UserProfile[] = []
                    if(community)
                        result = ProfileManager.searchProfilesIds(query, community.members)
                    completion(result)
                })
                break;
            }
            case ContextNaturalKey.USER: 
            {
                const me = AuthenticationManager.getAuthenticatedUser().id
                let result:UserProfile[] = []
                if(contextObjectId == me)
                {
                    const myContacts = ProfileManager.getContactListIds()
                    if(myContacts.length > 0)
                    {
                        ProfileManager.ensureProfilesExists(myContacts, () => {
                            result = ProfileManager.searchProfilesIds(query, myContacts)
                            completion(result)
                        })
                    }
                    else 
                    {
                        completion(result)
                    }
                }
                else {
                    ProfileManager.ensureProfilesExists([contextObjectId], () => {
                        const profile = ProfileManager.getProfileById(contextObjectId)
                        const mutualFriends = profile.mutual_friends || []
                        if(mutualFriends.length > 0)
                        {
                            ProfileManager.ensureProfilesExists(mutualFriends, () => {
                                result = ProfileManager.searchProfilesIds(query, mutualFriends)
                                completion(result)
                            })
                        }
                        else 
                        {
                            completion(result)
                        }
                        
                    })
                }
                break;
            }
            case ContextNaturalKey.GROUP: 
            {
                GroupManager.ensureGroupExists(contextObjectId, (group) => 
                {
                    let result:UserProfile[] = []
                    if(group)
                        result = ProfileManager.searchProfilesIds(query, group.members)
                    completion(result)
                })
                break;
            }
            case ContextNaturalKey.PROJECT: 
            {
                ProjectManager.ensureProjectExists(contextObjectId, (project) => 
                {
                    let result:UserProfile[] = []
                    if(project)
                        result = ProfileManager.searchProfilesIds(query, project.members)
                    completion(result)
                })
                break;
            }
            default:
            {
                console.log("searchMembersInContext", query, contextObjectId, contextNaturalKey)
                completion([]);
            }
        }
    }
    private static getStore = ():Store<RootState,any> =>
    {
        return window.store
    }
}