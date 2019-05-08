import { FileUploader } from '../network/ApiClient';
import { Message, UploadedFile } from "../types/intrasocial_types";
import { sendOnWebsocket, EventStreamMessageType } from '../network/ChannelEventStream';
import { ReduxState } from './index';
export enum MessageQueueActionTypes {
    AddMessage = 'messagequeue.add_message',
    RemoveMessage = 'messagequeue.remove_message',
    UpdateMessage = 'messagequeue.update_message',
    ProcessNextMessage = 'messagequeue.process_next_message',
    ProcessMessage = 'messagequeue.process_message',
    Reset = 'messagequeue.reset',
}
var messageQueueWorking = false
export type MessageQueue = {
    messages:Message[]
}
//actions
export type MessageQueueAction = {
    type:MessageQueueActionTypes
    message:Message
}
export const resetMessageQueueAction = ():MessageQueueAction => ({
    type: MessageQueueActionTypes.Reset, 
    message:null
})
export const addMessageToQueueAction = (message:Message):MessageQueueAction => ({
    type: MessageQueueActionTypes.AddMessage, 
    message
})
export const removeMessageFromQueueAction = (message:Message):MessageQueueAction => ({
    type: MessageQueueActionTypes.RemoveMessage, 
    message
})
export const updateMessageInQueueAction = (message:Message):MessageQueueAction => ({
    type: MessageQueueActionTypes.UpdateMessage, 
    message
})
export const processMessageInQueueAction = (message:Message):MessageQueueAction => ({
    type: MessageQueueActionTypes.ProcessMessage, 
    message
})
export const processNextMessageInQueueAction = ():MessageQueueAction => ({
    type: MessageQueueActionTypes.ProcessNextMessage, 
    message:null
})
const INITIAL_STATE:MessageQueue = { messages: [] }
const messageQueue = (state = INITIAL_STATE, action:MessageQueueAction):MessageQueue => {
    switch(action.type) 
    {
        case MessageQueueActionTypes.AddMessage:
            return { ...state, messages: [action.message].concat( state.messages)}
        case MessageQueueActionTypes.RemoveMessage:
            return { ...state, messages:state.messages.filter(m => {
                return m.uid != action.message.uid
            })}
        case MessageQueueActionTypes.UpdateMessage:
            return { ...state, messages:state.messages.map(m => {
                if (m.uid == action.message.uid)
                    return action.message
                return m
            }) 
        }
        case MessageQueueActionTypes.Reset:
            return { messages: [] }
        default:
            return state;
    }
}
export default messageQueue


const processMessage = (store, message:Message) => 
{
    if(messageQueueWorking)
        return
    messageQueueWorking = true
    if(message.tempFile && message.tempFile.file && message.tempFile.file instanceof File)
    {
        let file = message.tempFile.file
        let uploader = new FileUploader(file, (progress) => {
            let m = Object.assign({}, message)
            m.tempFile = Object.assign({}, m.tempFile)
            m.tempFile.progress = progress
            store.dispatch(updateMessageInQueueAction(m))
        })
        uploader.doUpload((file:UploadedFile) => {
            if(file)
            {
                let m = Object.assign({}, message)
                m.tempFile = Object.assign({}, m.tempFile)
                m.tempFile.fileId = file.id
                m.tempFile.file = {} as any
                store.dispatch(updateMessageInQueueAction(m))
                sendOnWebsocket(
                    JSON.stringify({
                        type: EventStreamMessageType.CONVERSATION_MESSAGE,
                        data: { conversation: message.conversation, text: message.text, uid: message.uid, mentions:message.mentions, files:[file.id] }
                    })
                )
            }
            else 
            {
                let m = Object.assign({}, message)
                m.tempFile = Object.assign({}, m.tempFile)
                m.tempFile.progress = 0
                m.tempFile.error = "error"
                messageQueueWorking = false
                store.dispatch(updateMessageInQueueAction(m))
            }
            messageQueueWorking = false
            
        })
    }
    else 
    {
        var data = { conversation: message.conversation, text: message.text, uid: message.uid, mentions:message.mentions } as any
        if(message.tempFile && message.tempFile.fileId)
        {
            data.files = [message.tempFile.fileId]
        }
        sendOnWebsocket(
            JSON.stringify({
                type: EventStreamMessageType.CONVERSATION_MESSAGE,
                data
            })
        )
        messageQueueWorking = false
    }
}
export const messageQueueMiddleware = store => next => action => {
    let result = next(action);
    if (action.type === MessageQueueActionTypes.AddMessage) {
        processMessage(store, action.message)
    }
    else if(action.type === MessageQueueActionTypes.RemoveMessage)
    {
        messageQueueWorking = false
        store.dispatch(processNextMessageInQueueAction())
    }
    else if(action.type === MessageQueueActionTypes.ProcessNextMessage)
    {
        let state = store.getState() as ReduxState
        if(state.messageQueue.messages.length > 0)
        {
            for(var i = 0; i < state.messageQueue.messages.length; i++)
            {
                var message = state.messageQueue.messages[i]
                if(!message.tempFile || message.tempFile.file && ((message.tempFile.file instanceof File && !message.tempFile.error) || message.tempFile.fileId) )
                {
                    processMessage(store, message)
                    break;
                }
            }
        }
    }
    else if(action.type === MessageQueueActionTypes.ProcessMessage)
    {
        let m = action.message as Message
        let state = store.getState() as ReduxState
        let index = state.messageQueue.messages.findIndex(msg => msg.uid == m.uid)
        if( index > -1)
        {
            processMessage(store, state.messageQueue.messages[index])
        }
        
    }
    return result;
  }