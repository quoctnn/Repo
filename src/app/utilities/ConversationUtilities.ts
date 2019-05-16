import { ProfileManager } from '../managers/ProfileManager';
import { Conversation, Message, UserProfile } from '../types/intrasocial_types';
import { nullOrUndefined } from './Utilities';
import { translate } from '../localization/AutoIntlProvider';
import { AuthenticationManager } from '../managers/AuthenticationManager';

export class ConversationUtilities 
{
    static getConversationTitle = (conversation: Conversation, me?:number) => {
        if(conversation.title)
            return conversation.title
        if(conversation.temporary && conversation.users.length == 0)
            return translate("New conversation")
        return ConversationUtilities.getConversationTitleFromMembers(conversation.users, me)
    }
    static getConversationTitleFromMembers = (members:number[], me?:number) => {
        const myId = me || AuthenticationManager.getAuthenticatedUser().id
        const profiles = ProfileManager.getProfiles(members.filter(i => i != myId))
        return ConversationUtilities.getConversationTitleFromProfiles(profiles, myId)
    }
    static getConversationTitleFromProfiles = (members:UserProfile[], me?:number) => {
        const myId = me || AuthenticationManager.getAuthenticatedUser()
        const profiles = members.filter(i => i.id != myId)
        return profiles.map(p => {
            if(p && p.first_name)
                return p.first_name
            return "Unknown User"
        }).join(", ")
    }
    static getChatMessagePreview(userId:number,text:string,file:File, mentions:number[], conversation:Conversation):Message {

        let uid = `${conversation.id}_${userId}_${Date.now()}`
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
