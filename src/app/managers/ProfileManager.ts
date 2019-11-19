import {  Store } from 'redux';
import { CommunityManager } from './CommunityManager';
import { UserProfile, ContextNaturalKey } from '../types/intrasocial_types';
import { AuthenticationManager } from './AuthenticationManager';
import { ReduxState } from '../redux';
import { addProfilesAction } from '../redux/profileStore';
import { userFullName, nullOrUndefined } from '../utilities/Utilities';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventStreamMessageType } from '../network/ChannelEventStream';
import { ProfileResolver } from '../network/ProfileResolver';

export type ProfileManagerSearchInContextProps = {
    search:string
    taggableMembers?:number[] | (() => number[])
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
    static getProfile = (profileId:string):UserProfile =>
    {
        const state = ProfileManager.getStore().getState()
        const isNumber = profileId.isNumber()
        const me = AuthenticationManager.getAuthenticatedUser()
        if(isNumber)//return by id
        {
            const id = parseInt(profileId)
            if(me && me.id == id)
                return me
            return state.profileStore.byId[id]
        }
        //return by slug
        let keys = Object.keys(state.profileStore.byId)
        let profiles = keys.map(k => state.profileStore.byId[parseInt(k)])
        if(me)
            profiles.unshift(me)
        return profiles.find(p => p.slug_name == profileId)
    }
    static ensureExists = (profileId:string|number, forceUpdate?: boolean) => {
        if(nullOrUndefined(profileId))
            return null
        const id = profileId.toString()
        let profile = ProfileManager.getProfile(id)
        if(!profile || forceUpdate)
        {
            ProfileResolver.resolveProfiles([id], (data) => {
                const profile = data && data[0]
                if(profile)
                {
                    ProfileManager.storeProfiles([profile])
                }
                else
                {
                    console.error("error fetching profile", profileId)
                }
            })
        }
        return profile
    }
    static ensureProfileExists = (profileId:string|number, completion:(profile:UserProfile) => void, forceUpdate?: boolean) =>
    {
        const id = profileId.toString()
        let profile = ProfileManager.getProfile(id)
        if(!profile || forceUpdate)
        {
            ProfileResolver.resolveProfiles([id], (data) => {
                const profile = data && data[0]
                if(profile)
                {
                    ProfileManager.storeProfiles([profile])
                }
                else
                {
                    console.error("error fetching profile", profileId)
                }
                completion(profile)
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
                const profiles = data && data.filter(p => !nullOrUndefined(p))
                if(profiles && profiles.length > 0)
                {
                    store.dispatch(addProfilesAction(data))
                }
                else
                {
                    console.error("error fetching profiles", requestIds)
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
    static searchProfilesInMembers = ({search, taggableMembers, completion}:ProfileManagerSearchInContextProps) => {

        if(taggableMembers)
        {
            let members = Array.isArray(taggableMembers) ? taggableMembers : taggableMembers()
            ProfileManager.searchProfileIdsEnsureExists(search, members, (profiles) => {
                completion(profiles)
            })
        }
        else {
            completion([])
        }
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}