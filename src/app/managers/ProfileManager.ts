import {  Store } from 'redux';
import { CommunityManager } from './CommunityManager';
import { UserProfile, ContextNaturalKey } from '../types/intrasocial_types';
import { AuthenticationManager } from './AuthenticationManager';
import { GroupManager } from './GroupManager';
import { ProjectManager } from './ProjectManager';
import { ReduxState } from '../redux';
import { addProfilesAction } from '../redux/profileStore';
import { userFullName } from '../utilities/Utilities';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventStreamMessageType } from '../network/ChannelEventStream';
import { ProfileResolver } from '../network/ProfileResolver';

export type ProfileManagerSearchInContextProps = {
    search:string
    taggableMembers?:number[] | (() => number[])
    contextObjectId?:number
    contextNaturalKey?:ContextNaturalKey
    completion:(members:UserProfile[]) => void
}
export abstract class ProfileManager
{
    static setup = () =>
    {
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.USER_UPDATE, ProfileManager.processIncomingUserUpdate)
    }
    private static processIncomingUserUpdate(...args:any[]) {
        let profile = args[0]
        ProfileManager.storeProfiles([profile], true)
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
    static ensureProfileExists = (profileId:string|number, completion:(profile:UserProfile) => void, forceUpdate?: boolean) =>
    {
        const id = profileId.toString()
        let profile = ProfileManager.getProfile(id)
        if(!profile || forceUpdate)
        {
            if(id.isNumber())
            {
                ProfileResolver.resolveProfiles([parseInt(id)], (data) => {
                    if(data)
                    {
                        ProfileManager.storeProfiles(data)
                    }
                    else
                    {
                        console.log("error fetching profile", profileId)
                    }
                    completion(data[0])
                })
            }
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
        ids.push(state.authentication.profile!.id)
        let requestIds = []
        if (profiles) {
            requestIds = profiles.filter(id => {
                const currentProfile = state.profileStore.byId[id]
                if(currentProfile && currentProfile.unresolved_time)
                {
                    const diff = new Date().getTime() - new Date(currentProfile.unresolved_time).getTime()
                    const minutes = Math.floor((diff/1000)/60)
                    return minutes >= 2 
                }
                return ids.indexOf(id) == -1
            })
        }
        if(requestIds.length > 0)
        {
            ProfileResolver.resolveProfiles(requestIds, (data) =>
            {
                if(data && data.length > 0)
                {
                    store.dispatch(addProfilesAction(data))
                }
                else
                {
                    console.log("error fetching profiles", requestIds)
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
        if (s.authentication.profile && s.authentication.profile.username == name)
          return s.authentication.profile;
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
        let authUser = s.authentication.profile!
        if(authUser!.id == profile)
            return authUser
        return s.profileStore.byId[profile]
    }
    static getProfiles = (profiles:number[]) =>
    {
        let s = ProfileManager.getStore().getState()
        let authUser = s.authentication.profile!
        let userProfiles = profiles.map(p =>{
            if(authUser!.id == p)
                return authUser
            return s.profileStore.byId[p]
        }).filter(u => u != null)
        return userProfiles
    }
    private static filterProfile = (query:string, profile:UserProfile) =>
    {
        let compareString = userFullName(profile)
        return compareString.toLowerCase().indexOf(query.toLowerCase()) > -1
    }

    static searchProfiles = ( query:string, communityId?:number, maxItems?:number, includeMe = false) =>
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
            searchables = ProfileManager.getContactListIds(includeMe)
        }
        const result = ProfileManager.searchProfileIds(query, searchables)
        if(maxItems)
            return result.slice(0, maxItems)
        return result
    }
    static searchProfileIds = ( query:string, profiles:number[]) =>
    {
        let users = ProfileManager.getProfiles(profiles || [])
        return users.filter(u => ProfileManager.filterProfile(query,u!))
    }
    static getContactListIds = (includeMe = false) => {
        const authUser = AuthenticationManager.getAuthenticatedUser()
        const profiles = [...(authUser && authUser.connections || [])]
        if(includeMe)
            profiles.unshift(authUser.id)
        return profiles
    }
    static storeProfiles = (profiles:UserProfile[], force?:boolean) => {
        ProfileManager.getStore().dispatch(addProfilesAction(profiles, force))
    }
    static storeProfile = (profile:UserProfile, force?:boolean) => {
        ProfileManager.getStore().dispatch(addProfilesAction([profile], force))
    }
    static searchProfileIdsEnsureExists = (query:string, profiles:number[], completion:(profiles:UserProfile[]) => void) => {
        ProfileManager.ensureProfilesExists(profiles, () => {
            const result = ProfileManager.searchProfileIds(query, profiles)
            completion(result)
        })
    }
    static searchProfilesInContext = ({search, taggableMembers, contextObjectId, contextNaturalKey, completion}:ProfileManagerSearchInContextProps) => {

        if(taggableMembers)
        {
            let members = Array.isArray(taggableMembers) ? taggableMembers : taggableMembers()
            if(members.length == 0) { // Global item, search all available profiles
                members = ProfileManager.getContactListIds()
            }
            ProfileManager.searchProfileIdsEnsureExists(search, members, (profiles) => {
                completion(profiles)
            })
        }
        else if(contextObjectId && contextNaturalKey){
            ProfileManager.searchMembersInContext(search, contextObjectId, contextNaturalKey, (members) => {
                completion(members)
            })
        }
        else {
            completion([])
        }
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
                        result = ProfileManager.searchProfileIds(query, community.members)
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
                            result = ProfileManager.searchProfileIds(query, myContacts)
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
                                result = ProfileManager.searchProfileIds(query, mutualFriends)
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
                        result = ProfileManager.searchProfileIds(query, group.members)
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
                        result = ProfileManager.searchProfileIds(query, project.members)
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
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}