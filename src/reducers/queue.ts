import {Types} from "../utilities/Types"
import { Message, UploadedFile } from './conversations';
import { sendOnWebsocket, SocketMessageType } from '../components/general/ChannelEventStream';
import { FileUploader } from '../network/ApiClient';
import * as Actions from '../actions/Actions';
import { RootState } from './index';

var messageQueueWorking = false
export interface Queue 
{
    chatMessages:Message[]
    statusMessages:Message[]
}
const INITIAL_STATE:Queue = { chatMessages: [], statusMessages:[]}
const queue = (state = INITIAL_STATE, action) => {
    switch(action.type) 
    {
        case Types.QUEUE_ADD_CHAT_MESSAGE:
            return { ...state, chatMessages: [action.message].concat( state.chatMessages)}
        case Types.QUEUE_REMOVE_CHAT_MESSAGE:
            return { ...state, chatMessages:state.chatMessages.filter(m => {
                return m.uid != action.message.uid
            })}
        case Types.QUEUE_REMOVE_CHAT_MESSAGE:
            return { ...state, chatMessages:state.chatMessages.filter(m => {
                return m.uid != action.message.uid
            })}
        case Types.QUEUE_UPDATE_CHAT_MESSAGE:
            return { ...state, chatMessages:state.chatMessages.map(m => {
                if (m.uid == action.message.uid)
                    return action.message
                return m
            }) 
        }
        case Types.QUEUE_RESET_DATA:
            return { chatMessages: [], statusMessages:[]}
        default:
            return state;
    }
}
export default queue

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
            store.dispatch(Actions.queueUpdateChatMessage(m))
        })
        uploader.doUpload((file:UploadedFile) => {
            if(file)
            {
                let m = Object.assign({}, message)
                m.tempFile = Object.assign({}, m.tempFile)
                m.tempFile.fileId = file.id
                m.tempFile.file = {} as any
                store.dispatch(Actions.queueUpdateChatMessage(m))
                sendOnWebsocket(
                    JSON.stringify({
                        type: SocketMessageType.CONVERSATION_MESSAGE,
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
                store.dispatch(Actions.queueUpdateChatMessage(m))
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
                type: SocketMessageType.CONVERSATION_MESSAGE,
                data
            })
        )
        messageQueueWorking = false
    }
}
export const messageQueueMiddleware = store => next => action => {
    let result = next(action);
    if (action.type === Types.QUEUE_ADD_CHAT_MESSAGE) {
        processMessage(store, action.message)
    }
    else if(action.type === Types.QUEUE_REMOVE_CHAT_MESSAGE)
    {
        messageQueueWorking = false
        store.dispatch(Actions.queueProcessNextChatMessage())
    }
    else if(action.type === Types.QUEUE_PROCESS_NEXT_CHAT_MESSAGE)
    {
        let queue = store.getState() as RootState
        if(queue.queue.chatMessages.length > 0)
        {
            for(var i = 0; i < queue.queue.chatMessages.length; i++)
            {
                var message = queue.queue.chatMessages[i]
                if(!message.tempFile || message.tempFile.file && ((message.tempFile.file instanceof File && !message.tempFile.error) || message.tempFile.fileId) )
                {
                    processMessage(store, message)
                    break;
                }
            }
        }
    }
    else if(action.type === Types.QUEUE_PROCESS_CHAT_MESSAGE)
    {
        let m = action.message as Message
        let queue = store.getState() as RootState
        let index = queue.queue.chatMessages.findIndex(msg => msg.uid == m.uid)
        if( index > -1)
        {
            processMessage(store, queue.queue.chatMessages[index])
        }
        
    }
    return result;
  }