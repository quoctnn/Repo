import {  Store } from 'redux';
import * as React from 'react';
import ApiClient from '../network/ApiClient';
import { Conversation, Message, UserProfile, Permission } from '../types/intrasocial_types';
import { EventStreamMessageType, sendOnWebsocket, canSendOnWebsocket } from '../network/ChannelEventStream';
import { ReduxState } from '../redux';
import { addConversationsAction, removeConversationAction } from '../redux/conversationStore';
import { updateMessageInQueueAction, processMessageInQueueAction, removeMessageFromQueueAction, processNextMessageInQueueAction, addMessageToQueueAction } from '../redux/messageQueue';
import { AuthenticationManager } from './AuthenticationManager';
import { NotificationCenter } from '../utilities/NotificationCenter';
import Routes from '../utilities/Routes';
import { ProfileManager } from './ProfileManager';
import { ToastManager } from './ToastManager';
import { translate } from '../localization/AutoIntlProvider';
import { setTemporaryConversationAction } from '../redux/tempCache';
import { nullOrUndefined } from '../utilities/Utilities';
export const ConversationManagerConversationRemovedEvent = "ConversationManagerConversationRemovedEvent"
export abstract class ConversationManager 
{
    static setup = () => 
    { 
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_NEW, ConversationManager.processIncomingConversation)
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_UPDATE, ConversationManager.processIncomingConversation)
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_MESSAGE, ConversationManager.processIncomingConversationMessage)
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_MESSAGE, ConversationManager.processIncomingConversationRemove)
    }
    static storeConversations = (conversations:Conversation[]) => {
        ConversationManager.getStore().dispatch(addConversationsAction(conversations))
    }
    static removeConversation = (conversationsId:number) => {
        ConversationManager.getStore().dispatch(removeConversationAction(conversationsId))
        NotificationCenter.push(ConversationManagerConversationRemovedEvent, [{conversation:conversationsId}])
    }
    static getConversation = (conversationId:number|string):Conversation => 
    {
        return ConversationManager.getStore().getState().conversationStore.byId[conversationId]
    }
    static deleteConversation = (conversationId:number, completion:(success:boolean) => void) => 
    {
        ApiClient.deleteConversation(conversationId, (data, status, error) => {
            const success = nullOrUndefined(error)
            if(nullOrUndefined(error))
            {
                ConversationManager.removeConversation(conversationId)
            }
            ToastManager.showErrorToast(error)
            completion(success)
        })
    }
    static archiveConversation = (conversationId:number, completion:(success:boolean) => void) => 
    {
        ApiClient.deleteConversation(conversationId, (data, status, error) => {
            const success = nullOrUndefined(error)
            ToastManager.showErrorToast(error)
            completion(success)
        })
    }
    static ensureConversationExists = (conversationId:number|string, completion:(conversation:Conversation) => void) => 
    {
        if(!conversationId.isNumber())
        {
            completion(null)
            return
        }
        let conversation = ConversationManager.getConversation(conversationId)
        if(!conversation)
        {
            const id = parseInt(conversationId.toString())
            ApiClient.getConversation(id, (data, status, error) => {
                if(data)
                {
                    ConversationManager.storeConversations([data])
                }
                else 
                {
                    console.log("error fetching conversation", error)
                }
                completion(data)
            })
        }
        else 
        {
            completion(conversation)
        }

    }
    private static processIncomingConversation = (...args:any[]) => 
    {
        let conversation = args[0] as Conversation
        ConversationManager.getStore().dispatch(addConversationsAction([conversation]))
    }
    private static processIncomingConversationRemove = (...args:any[]) => {
        let data:{conversation:number} = args[0]
        ConversationManager.removeConversation(data.conversation)
    } 
    private static processIncomingConversationMessage = (...args:any[]) => 
    {
        let store = ConversationManager.getStore()
        let message = args[0] as Message
        let me = AuthenticationManager.getAuthenticatedUser()
        store.dispatch(removeMessageFromQueueAction(message))
        if (message.user != me.id) 
        {
            ConversationManager.sendMessageNotification(message);
        } 
        ConversationManager.ensureConversationExists(message.conversation, () => { 
        })
        
    }
    static createTemporaryConversation = () => {

        let store = ConversationManager.getStore()
        const now = Date.now()
        const created = new Date()
        created.setFullYear(created.getFullYear() + 1)
        const ds = created.toUTCString()
        const conversation:Conversation = {
            id: now,
            created_at: ds,
            updated_at:ds,
            title:null,
            users:[],
            unread_messages:[],
            last_message:null,
            read_by:[],
            uri:Routes.conversationUrl("new"),
            permission:Permission.post,
            temporary:true
        }
        store.dispatch(setTemporaryConversationAction(conversation))
    }
    static updateTemporaryConversation = (conversation:Conversation) => {
        let store = ConversationManager.getStore()
        store.dispatch(setTemporaryConversationAction(conversation))
    }
    private static sendMessageNotification = (message: Message) =>  
    {
        let uri = Routes.conversationUrl(message.conversation)
        if (document.hasFocus()) 
        {
            // If tab is focused
            let user: UserProfile = ProfileManager.getProfileById(message.user)
            // Show the toast if the user is not viewing that conversation
            if (user && window.location.pathname != uri) 
            {
                ToastManager.showInfoToast(user.first_name + ': ' + message.text)
            }
        } 
        else if ('Notification' in window && Notification.permission === 'granted')
        {
            // If window is not active and notifications are enabled
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
    static leaveConversation = (conversationId:number, completion:(success:boolean) => void) => 
    {
        ApiClient.leaveConversation(conversationId, (data, status, error) => {
            const success = !error
            console.log(data,status, error)
            ToastManager.showErrorToast(error, status, translate("Could not leave conversation"))
            if(success)
            {
                ConversationManager.removeConversation(conversationId)
            }
            completion(success)
        })
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
        store.dispatch(addMessageToQueueAction(message))
    }
    //queue
    static processTempQueue = () => 
    {
        if (canSendOnWebsocket) 
        {
            ConversationManager.getStore().dispatch(processNextMessageInQueueAction())
        }
    }
    static removeQueuedMessage = (message:Message) => 
    {
        ConversationManager.getStore().dispatch(removeMessageFromQueueAction(message))
    }
    static retryQueuedMessage = (message:Message) => 
    {
        let m = Object.assign({}, message)
        m.tempFile = Object.assign({}, m.tempFile)
        m.tempFile.progress = 0
        m.tempFile.error = null
        ConversationManager.getStore().dispatch(updateMessageInQueueAction(m))
        ConversationManager.getStore().dispatch(processMessageInQueueAction(m))
    }
    private static getStore = ():Store<ReduxState,any> => 
    {
        return window.store 
    }
}