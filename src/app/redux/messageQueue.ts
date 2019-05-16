import { Message } from "../types/intrasocial_types";
export enum MessageQueueActionTypes {
    AddMessage = 'messagequeue.add_message',
    RemoveMessage = 'messagequeue.remove_message',
    UpdateMessage = 'messagequeue.update_message',
    ProcessNextMessage = 'messagequeue.process_next_message',
    ProcessMessage = 'messagequeue.process_message',
    Reset = 'messagequeue.reset',
}
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
            return { ...state, messages: state.messages.concat(action.message)}
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