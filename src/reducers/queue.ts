import {Types} from "../utilities/Types"
import { Message, UploadedFile } from './conversations';
import { sendOnWebsocket, SocketMessageType } from '../components/general/ChannelEventStream';
import { FileUploader } from '../network/ApiClient';
import * as Actions from '../actions/Actions';

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
        default:
            return state;
    }
}
export default queue
export const messageQueueMiddleware = store => next => action => {
    let result = next(action);
    if (action.type === Types.QUEUE_ADD_CHAT_MESSAGE) {
        if(messageQueueWorking)
            return
        messageQueueWorking = true
        let message = action.message as Message
        if(message.tempFile && message.tempFile.file)
        {
            let file = message.tempFile.file
            let uploader = new FileUploader(file, (progress) => {
                let m = Object.assign({}, message)
                m.tempFile = Object.assign({}, m.tempFile)
                m.tempFile.progress = progress
                store.dispatch(Actions.queueUpdateChatMessage(m))
            })
            uploader.doUpload((file:UploadedFile) => {
                sendOnWebsocket(
                    JSON.stringify({
                        type: SocketMessageType.CONVERSATION_MESSAGE,
                        data: { conversation: message.conversation, text: message.text, uid: message.uid, mentions:message.mentions, files:[file.id] }
                    })
                )
            })
        }
        else 
        {
            sendOnWebsocket(
                JSON.stringify({
                    type: SocketMessageType.CONVERSATION_MESSAGE,
                    data: { conversation: message.conversation, text: message.text, uid: message.uid, mentions:message.mentions }
                })
            )
        }
        
    }
    else if(action.type === Types.QUEUE_REMOVE_CHAT_MESSAGE)
    {
        messageQueueWorking = false
    }
    return result;
  }