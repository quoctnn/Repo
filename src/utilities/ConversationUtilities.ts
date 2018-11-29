import { Conversation } from '../reducers/conversations';
import { ProfileManager } from '../managers/ProfileManager';
export const getConversationTitle = (conversation: Conversation, me:number) => 
{
    if(conversation.title)
        return conversation.title
    return conversation.users.filter(i => i != me).map(u => {
        let p = ProfileManager.getProfile(u)
        if(p && p.first_name)
            return p.first_name
        return "Unknown User"
    }).join(", ")
}