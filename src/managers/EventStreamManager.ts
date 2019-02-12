import {  Store } from 'redux';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { ProfileManager } from './ProfileManager';
import { CommunityManager } from './CommunityManager';
import { RootState } from '../reducers';
import { AuthenticationManager } from './AuthenticationManager';
import { UserProfile } from '../types/intrasocial_types';
import * as Actions from '../actions/Actions';
import { eventStreamNotificationPrefix, EventStreamMessageType } from '../app/network/ChannelEventStream';
export abstract class EventStreamManager
{
    static setup = () => 
    {
        NotificationCenter.addObserver(eventStreamNotificationPrefix + EventStreamMessageType.STATE, EventStreamManager.eventstreamStateReceived)
        NotificationCenter.addObserver(eventStreamNotificationPrefix + EventStreamMessageType.SOCKET_STATE_CHANGE, EventStreamManager.eventstreamSocketStateChanged)
    }
    static eventstreamSocketStateChanged = (...args:any[]) => 
    {
        console.log("eventstreamSocketStateChanged args", args)
        EventStreamManager.socketDisconnected()
        AuthenticationManager.clearKeepAliveTimer()
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
    static socketDisconnected = () => 
    {
        AuthenticationManager.setAuthenticatedUser(null)
        EventStreamManager.getStore().dispatch(Actions.setDirtyPagedData())
    }
    private static getStore = ():Store<RootState,any> =>
    {
        return window.store
    }
}