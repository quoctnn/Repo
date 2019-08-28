import * as React from "react";
import { ProfileManager } from '../managers/ProfileManager';
import { Conversation, Message, UserProfile, UserStatus, UserStatusItem } from '../types/intrasocial_types';
import { nullOrUndefined, userAvatar } from './Utilities';
import { translate } from '../localization/AutoIntlProvider';
import { AuthenticationManager } from '../managers/AuthenticationManager';
import { Avatar } from "../components/general/Avatar";

export class ConversationUtilities 
{
    static maxVisibleAvatars = 5
    static avatarSize = 44
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
    static getAvatar = (conversation: Conversation, me:number, showUserStatus:boolean, children?: React.ReactNode) => {
        let users = ProfileManager.getProfiles(conversation.users.filter(i => i != me).slice(0, ConversationUtilities.maxVisibleAvatars))
        const avatars = users.map(u => userAvatar( u )).filter(a => !nullOrUndefined(a))
        let userStatusItem:UserStatusItem = undefined
        if(showUserStatus && users.length == 1)
            userStatusItem = UserStatus.getObject(users[0].user_status)
        return <Avatar statusColor={userStatusItem && userStatusItem.color} images={avatars} size={ConversationUtilities.avatarSize} borderColor="white" borderWidth={2}>
                        {!!children && children
                            || conversation.unread_messages.length > 0 &&
                            <div className="notification-badge bg-success text-white text-truncate"><span>{conversation.unread_messages.length}</span></div>
                        }
                </Avatar>
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
