import {  Store } from 'redux';
import { RootState } from '../reducers';
import * as Actions from '../actions/Actions';
import Routes from '../utilities/Routes';
import { translate } from '../components/intl/AutoIntlProvider';
import ApiClient from '../network/ApiClient';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { AuthenticationManager } from './AuthenticationManager';
import { ProfileManager } from './ProfileManager';
import { Message, UserProfile, Conversation } from '../types/intrasocial_types';
import { ToastManager } from './ToastManager';
import { EventStreamMessageType, canSendOnWebsocket, sendOnWebsocket } from '../app/network/ChannelEventStream';
export abstract class ConversationManager 
{
    static setup = () => 
    {
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_NEW, ConversationManager.processIncomingNewConversation)
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_MESSAGE, ConversationManager.processIncomingConversationMessage)
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_UPDATE, ConversationManager.processIncomingUpdateConversation)
    }
    static processTempQueue = () => 
    {
        if (canSendOnWebsocket) 
        {
            ConversationManager.getStore().dispatch(Actions.queueProcessNextChatMessage())
        }
    }
    static setConversation = (conversation:Conversation, isNew:boolean) => 
    {
        ConversationManager.getStore().dispatch(Actions.insertConversation(conversation, isNew))
    }
    static removeQueuedMessage = (message:Message) => 
    {
        ConversationManager.getStore().dispatch(Actions.queueRemoveChatMessage(message))
    }
    static retryQueuedMessage = (message:Message) => 
    {
        let m = Object.assign({}, message)
        m.tempFile = Object.assign({}, m.tempFile)
        m.tempFile.progress = 0
        m.tempFile.error = null
        ConversationManager.getStore().dispatch(Actions.queueUpdateChatMessage(m))
        ConversationManager.getStore().dispatch(Actions.queueProcessChatMessage(m))
    }
    private static processIncomingUpdateConversation = (...args:any[]) => 
    {
        let conversation = args[0] as Conversation
        ConversationManager.getStore().dispatch(Actions.insertConversation(conversation, false))
    }
    private static processIncomingNewConversation = (...args:any[]) => 
    {
        let conversation = args[0] as Conversation
        ConversationManager.getStore().dispatch(Actions.insertConversation(conversation, true))
    }
    private static processIncomingConversationMessage = (...args:any[]) => 
    {
        let store = ConversationManager.getStore()
        let message = args[0] as Message
        let me = AuthenticationManager.getAuthenticatedUser()!
        if (message.user == me.id) 
        {
            store.dispatch(Actions.queueRemoveChatMessage(message))
        } 
        else 
        {
            store.dispatch(Actions.queueRemoveChatMessage(message))
            ConversationManager.sendMessageNotification(message);
        }
        ConversationManager.ensureConversationExists(message.conversation, () => { 
            store.dispatch(Actions.insertChatMessage(message.conversation.toString(), message))
        })
        
    }
    static ensureConversationExists = (conversationId:number, completion:() => void) => 
    {
        let store = ConversationManager.getStore()
        let conversation = store.getState().conversations.pagination.items[conversationId]
        if(!conversation)
        {
            ApiClient.getConversation(conversationId, (data, status, error) => {
                if(data)
                {
                    store.dispatch(Actions.insertConversation(data, false))
                }
                else 
                {
                    console.log("error fetching conversation", error)
                }
                completion()
            })
        }
        else 
        {
            completion()
        }

    }
    static markConversationAsRead = (conversationId:number, completion:() => void) => 
    {
        ApiClient.markConversationAsRead(conversationId, (data, status, error) => {
            completion()
        })
    }
    static sendTypingInConversation = (conversation: number) => 
    {
        sendOnWebsocket(
          JSON.stringify({
            type: EventStreamMessageType.CONVERSATION_TYPING,
            data: { conversation: conversation }
          })
        );
    }
    static sendMessage = (message:Message) => 
    {
        let store = ConversationManager.getStore()
        store.dispatch(Actions.queueAddChatMessage(message))
    }
    private static sendMessageNotification = (message: Message) =>  
    {
        let uri = Routes.conversationUrl(message.conversation);
        if (document.hasFocus()) 
        {
            // If tab is focused
            let user: UserProfile = ProfileManager.getProfileById(message.user);
            // Show the toast if the user is not viewing that conversation
            if (user && window.location.pathname != uri) 
            {
                ToastManager.showInfoToast(user.first_name + ': ' + message.text)
            }
        } 
        else if ('Notification' in window && Notification.permission === 'granted')
        {
            // If window is not active and notifications are enabled
            if (Notification.permission === 'granted') 
            {
                let user: UserProfile = ProfileManager.getProfileById(message.user);
                if (user) 
                {
                    var options = {
                    body: user.first_name + ': ' + message.text,
                    tag: 'conversation_' + message.conversation
                    };
                    var notification = (new Notification(
                        translate('New Message'),
                        options
                    ).onclick = function(event) {
                        window.open(uri);
                    });
                }
            }
        }
    }
    private static getStore = ():Store<RootState,any> => 
    {
        return window.store 
    }
}