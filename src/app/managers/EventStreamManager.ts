import {  Store } from 'redux';
import { ProfileManager } from './ProfileManager';
import { CommunityManager } from './CommunityManager';
import { AuthenticationManager } from './AuthenticationManager';
import { UserProfile } from '../types/intrasocial_types';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventStreamMessageType, eventStreamNotificationPrefix, WebsocketState } from '../network/ChannelEventStream';
import { ReduxState } from '../redux/index';
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
        if(WebsocketState.CLOSED == args[0])
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
        //EventStreamManager.getStore().dispatch(Actions.setDirtyPagedData())
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}