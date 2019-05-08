import { ProfileManager } from '../managers/ProfileManager';
import { Conversation, Message, UserProfile } from '../types/intrasocial_types';
import { nullOrUndefined } from './Utilities';

export class ConversationUtilities 
{
    static getConversationTitle = (conversation: Conversation, me:number) => {
        if(conversation.title)
            return conversation.title
        return ConversationUtilities.getConversationTitleFromMembers(conversation.users, me)
    }
    static getConversationTitleFromMembers = (members:number[], me:number) => {
        const profiles = ProfileManager.getProfiles(members.filter(i => i != me))
        return ConversationUtilities.getConversationTitleFromProfiles(profiles, me)
    }
    static getConversationTitleFromProfiles = (members:UserProfile[], me:number) => {
        const profiles = members.filter(i => i.id != me)
        return profiles.map(p => {
            if(p && p.first_name)
                return p.first_name
            return "Unknown User"
        }).join(", ")
    }
    static getChatMessagePreview(userId:number,text:string,file:File, uid:string, mentions:number[], conversation:Conversation):Message {
        const now = Date.now()
        const ds = new Date().toUTCString()
        const tempFile = nullOrUndefined(file) ? null: {file:file, progress:0, name:file.name, size:file.size, type:file.type, error:null}
        const message = {
            id: now,
            uid:uid,
            pending:true,
            text: text,
            user: userId,
            created_at: ds,
            conversation:conversation.id,
            attachment:null,
            updated_at:ds,
            read_by:[],
            mentions:mentions,
            tempFile
        }
        return message
    }
}
