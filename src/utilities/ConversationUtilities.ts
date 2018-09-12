import { Conversation } from '../reducers/conversations';
import { getProfileById } from '../main/App';
export const getConversationTitle = (conversation: Conversation, me:number) => 
{
    if(conversation.title)
        return conversation.title
    return conversation.users.filter(i => i != me).map(u => {
        let p = getProfileById(u)
        if(p && p.first_name)
            return p.first_name
        return "Unknown User"
    }).join(", ")
}