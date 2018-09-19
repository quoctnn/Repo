import {  Store } from 'redux';
import { RootState } from '../../reducers';
import { addSocketEventListener, SocketMessageType, canSendOnWebsocket, sendOnWebsocket } from '../../components/general/ChannelEventStream';
import { Conversation, Message } from '../../reducers/conversations';
import * as Actions from '../../actions/Actions';
import { Routes } from '../../utilities/Routes';
import { toast } from 'react-toastify';
import { UserProfile } from '../../reducers/profileStore';
import { translate } from '../../components/intl/AutoIntlProvider';
import { InfoToast } from '../../components/general/Toast';
import * as React from 'react';
import { getProfileById } from '../App';
import ApiClient from '../../network/ApiClient';
class ConversationManagerSingleton 
{
    constructor()
    {
        this.setup = this.setup.bind(this)
        this.getStore = this.getStore.bind(this)
        this.processIncomingNewConversation = this.processIncomingNewConversation.bind(this)
        this.processIncomingConversationMessage = this.processIncomingConversationMessage.bind(this)
        this.processIncomingUpdateConversation = this.processIncomingUpdateConversation.bind(this)
        this.sendMessageNotification = this.sendMessageNotification.bind(this)
        this.sortConversations = this.sortConversations.bind(this)
        this.sendMessageNotification = this.sendMessageNotification.bind(this)
        this.processTempQueue = this.processTempQueue.bind(this)
        this.ensureConversationExists = this.ensureConversationExists.bind(this)
        
    }
    setup()
    {
        addSocketEventListener(SocketMessageType.CONVERSATION_NEW, this.processIncomingNewConversation)
        addSocketEventListener(SocketMessageType.CONVERSATION_MESSAGE, this.processIncomingConversationMessage)
        addSocketEventListener(SocketMessageType.CONVERSATION_UPDATE, this.processIncomingUpdateConversation)
    }
    processTempQueue() 
    {
        if (canSendOnWebsocket) 
        {
            let state = this.getStore().getState()
            if (state.queue.chatMessages.length > 0) 
            {
                state.queue.chatMessages.reverse().forEach(m => {
                    this.sendMessageToConversation(m.conversation, m.text, m.uid, m.mentions);
                });
            }
        }
    }
    setConversation(conversation:Conversation, isNew:boolean)
    {
        this.getStore().dispatch(Actions.insertConversation(conversation, isNew))
    }
    private processIncomingUpdateConversation(event:CustomEvent)
    {
        let conversation = event.detail.data as Conversation
        this.getStore().dispatch(Actions.insertConversation(conversation, false))
    }
    private processIncomingNewConversation(event:CustomEvent)
    {
        let conversation = event.detail.data as Conversation
        this.getStore().dispatch(Actions.insertConversation(conversation, true))
    }
    private processIncomingConversationMessage(event:CustomEvent)
    {
        let store = this.getStore()
        let message = event.detail.data as Message
        if (message.user == store.getState().profile.id) 
        {
            store.dispatch(Actions.queueRemoveChatMessage(message))
        } else 
        {
            store.dispatch(Actions.queueRemoveChatMessage(message))
            this.sendMessageNotification(message);
        }
        this.ensureConversationExists(message.conversation, () => { 
            store.dispatch(Actions.insertChatMessage(message.conversation.toString(), message))
            this.sortConversations()
        })
        
    }
    ensureConversationExists(conversationId:number, completion:() => void)
    {
        let store = this.getStore()
        let conversation = store.getState().conversations.items[conversationId]
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
    markConversationAsRead(conversationId:number, completion:() => void)
    {
        ApiClient.markConversationAsRead(conversationId, (data, status, error) => {
            completion()
        })
    }
    sendTypingInConversation(conversation: number)
    {
        sendOnWebsocket(
          JSON.stringify({
            type: SocketMessageType.CONVERSATION_TYPING,
            data: { conversation: conversation }
          })
        );
    }
    sendMessageToConversation( conversation: number, text: string, uid: string, mentions:number[])
    {
        sendOnWebsocket(
            JSON.stringify({
            type: SocketMessageType.CONVERSATION_MESSAGE,
            data: { conversation: conversation, text: text, uid: uid, mentions }
            })
        )
    }
    private sortConversations()
    {
        let store = this.getStore()
        let state = store.getState()
        let conversations = Object.keys(state.conversations.items).map(k => state.conversations.items[k])
        let sortedIds = conversations.sort((a,b) => {
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        }).map(c => c.id)
        store.dispatch(Actions.setSortedConversationIds(sortedIds))
    }
    private sendMessageNotification(message: Message) 
    {
        let uri = Routes.CONVERSATION + message.conversation;
        if (document.hasFocus()) 
        {
            // If tab is focused
            let user: UserProfile = getProfileById(message.user);
            // Show the toast if the user is not viewing that conversation
            if (user && window.location.pathname != uri) 
            {
                toast.info(<InfoToast message={user.first_name + ': ' + message.text} />);
            }
        } 
        else if ('Notification' in window && Notification.permission === 'granted')
        {
            // If window is not active and notifications are enabled
            if (Notification.permission === 'granted') 
            {
                let user: UserProfile = getProfileById(message.user);
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
    private getStore():Store<RootState,any>
    {
        return window.store 
    }
}
export let ConversationManager = new ConversationManagerSingleton();