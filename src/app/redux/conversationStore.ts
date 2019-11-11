import { combineReducers } from 'redux'
import { Conversation, IdentifiableObject } from '../types/intrasocial_types';
import { shallowCompareFields } from '../utilities/Utilities';
export enum ConversationStoreActionTypes {
    AddConversations = 'conversationstore.add_conversations',
    UpdateConversation = 'conversationstore.update_conversation',
    RemoveConversation = 'conversationstore.remove_conversation',
    Reset = 'conversationstore.reset',
}
export interface AddConversationsAction{
    type:string
    conversations:Conversation[]
}
export interface RemoveConversationsAction{
    type:string
    conversation:number
}
export interface ResetConversationsAction{
    type:string
}
export const addConversationsAction = (conversations: Conversation[]):AddConversationsAction => ({
    type: ConversationStoreActionTypes.AddConversations,
    conversations
})
export const updateConversationAction = (conversation: Conversation):AddConversationsAction => ({
    type: ConversationStoreActionTypes.UpdateConversation,
    conversations:[conversation]
})
export const removeConversationAction = (conversation: number):RemoveConversationsAction => ({
    type: ConversationStoreActionTypes.RemoveConversation,
    conversation
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
const shouldUpdate = (oldConversation:Conversation, newConversation:Conversation) => {
    if(!oldConversation)
        return true
    const fieldsUpdated = !shallowCompareFields(["users"], oldConversation, newConversation)
    if(fieldsUpdated)
    {
        return true
    }
    return new Date(newConversation.updated_at).getTime() > new Date(oldConversation.updated_at).getTime()
}

const updateConversation = (state, action:AddConversationsAction) => {
    const object:Partial<Conversation> = action.conversations[0]
    const oldObject:Conversation = state[object.id]
    if(object && oldObject)
    {
        const updatedObject = Object.assign({...oldObject}, object)
        const newState = {  ...state }
        newState[updatedObject.id] = updatedObject
        return newState
    }
    return state
}
const addConversations = (state, action:AddConversationsAction) => {
    let conversations = action.conversations
    let newState = {  ...state }
    conversations.forEach(c => {
        let id = c.id
        let old = state[id]
        if(shouldUpdate(old, c)) // update
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
const removeConversation = (state, action:RemoveConversationsAction) => {
    let newState = {  ...state }
    delete newState[action.conversation]
    return newState
}
const removeConversationId = (state:number[], action:RemoveConversationsAction) => {
    return [...state].filter(c => c != action.conversation)
}
export const conversationsById = (state = {}, action:ResetConversationsAction & AddConversationsAction & RemoveConversationsAction ) => 
{
    switch(action.type) {
        case ConversationStoreActionTypes.AddConversations: return addConversations(state, action);
        case ConversationStoreActionTypes.UpdateConversation: return updateConversation(state, action);
        case ConversationStoreActionTypes.RemoveConversation: return removeConversation(state, action);
        case ConversationStoreActionTypes.Reset: return resetConversations(state, action)
        default : return state;
    }
}
export const allConversations = (state:number[] = [], action) => 
{
    switch(action.type) {
        case ConversationStoreActionTypes.AddConversations: return addConversationIds(state, action)
        case ConversationStoreActionTypes.RemoveConversation: return removeConversationId(state, action)
        case ConversationStoreActionTypes.Reset: return resetConversationIds(state, action)
        default : return state;
    }
}
export const conversationStore = combineReducers({
    byId : conversationsById,
    allIds : allConversations
})