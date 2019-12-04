import {  Store } from 'redux';
import {ApiClient} from '../network/ApiClient';
import { Conversation, Message, UserProfile, Permission } from '../types/intrasocial_types';
import { EventStreamMessageType } from '../network/ChannelEventStream';
import { ReduxState } from '../redux';
import { addConversationsAction, removeConversationAction, updateConversationAction } from '../redux/conversationStore';
import { updateMessageInQueueAction, removeMessageFromQueueAction, processNextMessageInQueueAction, addMessageToQueueAction } from '../redux/messageQueue';
import { AuthenticationManager } from './AuthenticationManager';
import { NotificationCenter } from '../utilities/NotificationCenter';
import Routes from '../utilities/Routes';
import { ProfileManager } from './ProfileManager';
import { ToastManager } from './ToastManager';
import { translate, lazyTranslate } from '../localization/AutoIntlProvider';
import { setTemporaryConversationAction } from '../redux/tempCache';
import { nullOrUndefined } from '../utilities/Utilities';
import { WindowAppManager } from './WindowAppManager';
export const ConversationManagerConversationRemovedEvent = "ConversationManagerConversationRemovedEvent"
export abstract class ConversationManager
{
    static setup = () =>
    {
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_NEW, ConversationManager.processIncomingConversation)
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_UPDATE, ConversationManager.processIncomingConversation)
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_MESSAGE_NEW, ConversationManager.processIncomingConversationMessage)
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_REMOVE, ConversationManager.processIncomingConversationRemove)
    }
    static storeConversations = (conversations:Conversation[]) => {
        ConversationManager.getStore().dispatch(addConversationsAction(conversations))
    }
    static updateConversation = (conversation:Partial<Conversation>) => {
        ConversationManager.getStore().dispatch(updateConversationAction(conversation as Conversation))
    }
    static removeConversation = (conversationsId:number) => {
        ConversationManager.getStore().dispatch(removeConversationAction(conversationsId))
        NotificationCenter.push(ConversationManagerConversationRemovedEvent, [{conversation:conversationsId, temporary:false}])
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
            ToastManager.showRequestErrorToast(error)
            completion(success)
        })
    }
    static archiveConversation = (conversationId:number, completion:(success:boolean) => void) =>
    {
        ApiClient.archiveConversation(conversationId, (data, status, error) => {
            const success = nullOrUndefined(error)
            ToastManager.showRequestErrorToast(error)
            completion(success)
        })
    }
    static ensureExists = (conversationId:number|string) =>
    {
        if(!conversationId.isNumber())
        {
            return null
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
                    console.error("error fetching conversation", error)
                }
            })
        }
        return conversation
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
                    console.error("error fetching conversation", error)
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
        let data:{id:number} = args[0]
        ConversationManager.removeConversation(data.id)
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
    static createTemporaryConversation = (creator:number) => {

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
            temporary:true,

        }
        store.dispatch(setTemporaryConversationAction(conversation))
    }
    static updateTemporaryConversation = (conversation:Conversation) => {
        if(!!conversation)
            conversation.updated_at = new Date().toUTCString()
        let store = ConversationManager.getStore()
        const tempConversation = store.getState().tempCache.conversation
        store.dispatch(setTemporaryConversationAction(conversation))
        if(tempConversation && !conversation)
        {
            NotificationCenter.push(ConversationManagerConversationRemovedEvent, [{conversation:tempConversation.id, temporary:true}])
        }
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
                ToastManager.showInfoToast(user.first_name + ': ' + message.text, null, uri)
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
            ToastManager.showRequestErrorToast(error, lazyTranslate("Could not leave conversation"))
            if(success)
            {
                ConversationManager.removeConversation(conversationId)
                ToastManager.showInfoToast(translate("You left the conversation!"))
            }
            completion(success)
        })
    }
    static removeUsersFromConversation = (conversationId:number, users:number[], completion:(success:boolean, conversation:Partial<Conversation>) => void) =>
    {
        ApiClient.removeConversationUsers(conversationId, users, (data, status, error) => {
            const success = !error
            ToastManager.showRequestErrorToast(error, lazyTranslate("Could not remove user(s) from conversation"))
            completion(success, data)
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
        WindowAppManager.sendOutgoingOnSocket(
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
        ConversationManager.processTempQueue()
    }
    private static createMessage(message:Message, completion?:() => void){
        ApiClient.createMessage(message, (newMessage, status, error) => {
            if(newMessage)
            {
                ConversationManager.removeQueuedMessage(message)
            }
            completion && completion()
        })
    }
    static getQueuedMessages = (conversationId:number, onlyErrors:boolean = false) => {
        return ConversationManager.getStore().getState().messageQueue.messages.filter(m => m.conversation == conversationId && (onlyErrors ? (m.error || ((m.tempFiles || []).some(f =>  f.error))) : true ))
    }
    //queue
    static processTempQueue = () =>
    {
        const messages = [...ConversationManager.getStore().getState().messageQueue.messages].reverse()
        const processNext = () => {
            const message = messages.pop()
            if(message)
            {
                ConversationManager.createMessage(message, processNext)
            }
        }
        processNext()
    }
    static removeQueuedMessage = (message:Message) =>
    {
        ConversationManager.getStore().dispatch(removeMessageFromQueueAction(message))
    }
    static updateQueuedMessage = (message:Message) =>
    {
        ConversationManager.getStore().dispatch(updateMessageInQueueAction(message))
    }
    static retryQueuedMessage = (message:Message) =>
    {
        let m = Object.assign({}, message)
        m.tempFiles = (m.tempFiles || []).map(f => Object.assign({}, f))
        m.tempFiles.forEach(f => {
            f.error = null
            f.progress = 0
        })
        ConversationManager.getStore().dispatch(updateMessageInQueueAction(m))
        ConversationManager.createMessage(m)
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}