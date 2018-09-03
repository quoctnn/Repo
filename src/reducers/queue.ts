import {Types} from "../utilities/Types"
import { Message } from './conversationStore';

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
            let s = { ...state, chatMessages: state.chatMessages.map((m) => m)}
            s.chatMessages.push(action.message)
            return s
        case Types.QUEUE_REMOVE_CHAT_MESSAGE:
            return { ...state, chatMessages:state.chatMessages.filter(m => {
                return m.uid != action.message.uid
            })}
        default:
            return state;
    }
}
export default queue