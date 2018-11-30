import {  Store } from 'redux';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { ProfileManager } from './ProfileManager';
import { CommunityManager } from './CommunityManager';
import { EventStreamMessageType } from '../components/general/ChannelEventStream';
import { RootState } from '../reducers';
import { AuthenticationManager } from './AuthenticationManager';
import { UserProfile } from '../types/intrasocial_types';
export abstract class EventStreamManager
{
    static setup = () => 
    {
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.STATE, EventStreamManager.eventstreamStateReceived)
    }
    static eventstreamStateReceived = (...args:any[]) => 
    {
        console.log("eventstreamStateReceived", args)
        let state = args[0]
        let contacts: UserProfile[] = state.contacts || []
        ProfileManager.storeProfiles(contacts)
        ProfileManager.setContactListCache(contacts.map(i => i.id))
        CommunityManager.storeCommunities(state.communities || []);
        AuthenticationManager.setAuthenticatedUser(state.user)
    }
    private static getStore = ():Store<RootState,any> =>
    {
        return window.store
    }
}