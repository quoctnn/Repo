import { ProfileManager } from '../managers/ProfileManager';
import { Conversation } from '../types/intrasocial_types';
export const getConversationTitle = (conversation: Conversation, me:number) => {
    if(conversation.title)
        return conversation.title
    return conversation.users.filter(i => i != me).map(u => {
        let p = ProfileManager.getProfileById(u)
        if(p && p.first_name)
            return p.first_name
        return "Unknown User"
    }).join(", ")
}