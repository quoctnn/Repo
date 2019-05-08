import { combineReducers } from 'redux'
import { Conversation } from "../types/intrasocial_types";
export enum ConversationStoreActionTypes {
    AddConversations = 'conversationstore.add_conversations',
    Reset = 'conversationstore.reset',
}
export interface AddConversationsAction{
    type:string
    conversations:Conversation[]
}
export interface ResetConversationsAction{
    type:string
}
export const addConversationsAction = (conversations: Conversation[]):AddConversationsAction => ({
    type: ConversationStoreActionTypes.AddConversations,
    conversations
})
export const resetConversationsAction = ():ResetConversationsAction => ({
    type: ConversationStoreActionTypes.Reset,
})
​const resetConversations = (state, action:ResetConversationsAction) => {
    
    return {};
}
​​const resetConversationIds = (state, action:ResetConversationsAction) => {
    
    return []
}
const addConversations = (state, action:AddConversationsAction) => {
    let conversations = action.conversations
    let newState = {  ...state }
    conversations.forEach(c => {
        let id = c.id
        let old = state[id]
        if(!old || new Date(c.updated_at) >= new Date(old.updated_at)) // update
        {
            newState[c.id] = c
        }
    })
    return newState
}
const addConversationIds = (state:number[], action:AddConversationsAction) => {
    
    let conversations = action.conversations
    let newState = [...state]
    conversations.forEach(c => {
        let id = c.id
        if(state.indexOf(id) == -1)
        {
            newState.push(id)
        }
    })
    return newState
}
export const conversationsById = (state = {}, action:ResetConversationsAction & AddConversationsAction ) => 
{
    switch(action.type) {
        case ConversationStoreActionTypes.AddConversations: return addConversations(state, action);
        case ConversationStoreActionTypes.Reset: return resetConversations(state, action)
        default : return state;
    }
}
export const allConversations = (state:number[] = [], action) => 
{
    switch(action.type) {
        case ConversationStoreActionTypes.AddConversations: return addConversationIds(state, action)
        case ConversationStoreActionTypes.Reset: return resetConversationIds(state, action)
        default : return state;
    }
}
export const conversationStore = combineReducers({
    byId : conversationsById,
    allIds : allConversations
})