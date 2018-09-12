import {Types} from "../utilities/Types"
import { Message } from './conversations';

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
        default:
            return state;
    }
}
export default queue