import * as React from "react";
import classnames = require("classnames");
import { NotificationGroupKey, InvitationNotification, ContextNaturalKey, Community, Group, UserProfile, Event, Conversation, StatusNotification, AttentionNotification, ReminderNotification } from '../../types/intrasocial_types';
import ApiClient from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { translate } from '../../localization/AutoIntlProvider';
import { Button } from "reactstrap";
import { ListItem } from "../general/List";
import { ProfileManager } from '../../managers/ProfileManager';
import { Avatar } from "../general/Avatar";
import { userAvatar, userFullName, groupAvatar, communityAvatar, eventAvatar } from '../../utilities/Utilities';
import { Link } from 'react-router-dom';
import Routes from '../../utilities/Routes';
import { TimeComponent } from "../general/TimeComponent";
import { ConversationUtilities } from '../../utilities/ConversationUtilities';
import { MessageContent } from "../../modules/conversation/MessageContent";

enum NotificationContextType 
{
    TASK = "task",
    STATUS = "status",
}
type InvitationComponentProps = {
    link?:string
    avatar:React.ReactNode
    avatarLink?:string
    title:React.ReactNode
    children?:React.ReactNode
    message?:React.ReactNode
    createdAt:string
}
const InvitationComponent = (props:InvitationComponentProps) => {

    const avt = typeof props.avatar == "string" ? <Avatar image={props.avatar} /> : props.avatar
    const avatar = !!props.avatarLink ? <Link to={props.avatarLink}>{avt}</Link> : avt
    const header = !!props.link ? <Link to={props.link} className="title">{props.title}</Link> : props.title
    return <ListItem className="invitation p-2" hasAction={true}>
                <div className="d-flex w-100">
                    {avatar}
                    <div className="primary-text profile d-flex flex-column flex-grow-1 ml-2 text-truncate">
                        <div className="header d-flex justify-content-between">
                            {header}
                            <div className="small-text flex-shrink-0">
                                <TimeComponent date={props.createdAt} />
                            </div>
                        </div>
                        {props.message && <div className="secondary-text medium-small-text message mb-1">{props.message}</div>}
                        {props.children && <div className="d-flex">
                            {props.children}
                        </div>}
                    </div>
                </div>
            </ListItem>
}
type InvitationProps = {
    invitation:InvitationNotification
    onCompleted:(id:number) => void
}
const CommunityInvitation = (props:InvitationProps) => {
    const join = () => {
        ApiClient.communityInvitationAccept(props.invitation.id, (data, status, error) => {
            if(!error)
            {
                sendCompleted()
            }
            ToastManager.showErrorToast(error, status, translate("invitation.error.respond"))
        })
    }
    const dismiss = () => {
        ApiClient.communityInvitationDelete(props.invitation.id, (data, status, error) => {
            if(!error)
            {
                sendCompleted()
            }
            ToastManager.showErrorToast(error, status, translate("invitation.error.respond"))
        })
    }
    const sendCompleted = () => {
        props.onCompleted(props.invitation.id)
    }
    const community = props.invitation.context_object as Community
    const avatar = communityAvatar(community)
    const link = community.uri || "#"
    const title = community.name
    const profile = ProfileManager.getProfileById(props.invitation.invited_by)
    const inviterName = userFullName(profile, null) || translate("Someone")
    const message = <><Link to={Routes.profileUrl(props.invitation.invited_by)}>{inviterName}</Link> {translate("invitation.invite.join")}</>
    return <InvitationComponent avatarLink={link} createdAt={props.invitation.created_at} title={title} link={link} avatar={avatar} message={message}>
                <Button onClick={join} color="secondary" size="xs">{translate("invitation.join")}</Button>
                <Button outline={true} className="ml-1" onClick={dismiss} color="secondary" size="xs">{translate("invitation.dismiss")}</Button>
            </InvitationComponent>
}
const GroupInvitation = (props:InvitationProps) => {
    const join = () => {
        ApiClient.groupInvitationAccept(props.invitation.id, (data, status, error) => {
            if(!error)
            {
                sendCompleted()
            }
            ToastManager.showErrorToast(error, status, translate("invitation.error.respond"))
        })
    }
    const dismiss = () => {
        ApiClient.groupInvitationDelete(props.invitation.id, (data, status, error) => {
            if(!error)
            {
                sendCompleted()
            }
            ToastManager.showErrorToast(error, status, translate("invitation.error.respond"))
        })
    }
    const sendCompleted = () => {
        props.onCompleted(props.invitation.id)
    }
    const group = props.invitation.context_object as Group
    const avatar = groupAvatar(group)
    const link = group.uri || "#"
    const title = group.name
    const profile = ProfileManager.getProfileById(props.invitation.invited_by)
    const inviterName = userFullName(profile, null) || translate("Someone")
    const message = <><Link to={Routes.profileUrl(props.invitation.invited_by)}>{inviterName}</Link> {translate("invitation.invite.join")}</>
    return <InvitationComponent avatarLink={link} createdAt={props.invitation.created_at} title={title} link={link} avatar={avatar} message={message}>
                <Button onClick={join} color="secondary" size="xs">{translate("invitation.join")}</Button>
                <Button outline={true} className="ml-1" onClick={dismiss} color="secondary" size="xs">{translate("invitation.dismiss")}</Button>
            </InvitationComponent>
}
const FriendshipInvitation = (props:InvitationProps) => {
    const accept = () => {
        ApiClient.friendInvitationAccept(props.invitation.id, (data, status, error) => {
            if(!error)
            {
                sendCompleted()
            }
            ToastManager.showErrorToast(error, status, translate("invitation.error.respond"))
        })
    }
    const dismiss = () => {
        ApiClient.friendInvitationDelete(props.invitation.id, false, (data, status, error) => {
            if(!error)
            {
                sendCompleted()
            }
            ToastManager.showErrorToast(error, status, translate("invitation.error.respond"))
        })
    }
    const block = () => {
        ApiClient.friendInvitationDelete(props.invitation.id, true, (data, status, error) => {
            if(!error)
            {
                sendCompleted()
            }
            ToastManager.showErrorToast(error, status, translate("invitation.error.respond"))
        })
    }
    const sendCompleted = () => {
        props.onCompleted(props.invitation.id)
    }
    const profile = props.invitation.context_object as UserProfile
    const avatar = userAvatar(profile)
    const link = profile.uri || "#"
    const title = userFullName(profile, null) || translate("Someone")
    const message = props.invitation.message
    return <InvitationComponent avatarLink={link} createdAt={props.invitation.created_at} title={title} link={link} avatar={avatar} message={message}>
                <Button onClick={accept} color="secondary" size="xs">{translate("invitation.accept")}</Button>
                <Button outline={true} className="ml-1" onClick={dismiss} color="secondary" size="xs">{translate("invitation.dismiss")}</Button>
                <Button outline={true} className="ml-1" onClick={block} color="secondary" size="xs">{translate("invitation.block")}</Button>
            </InvitationComponent>
}
const EventInvitation = (props:InvitationProps) => {
    const going = () => {
        ApiClient.eventInvitationGoing(props.invitation.id, (data, status, error) => {
            if(!error)
            {
                sendCompleted()
            }
            ToastManager.showErrorToast(error, status, translate("invitation.error.respond"))
        })
    }
    const notGoing = () => {
        ApiClient.eventInvitationNotGoing(props.invitation.id, (data, status, error) => {
            if(!error)
            {
                sendCompleted()
            }
            ToastManager.showErrorToast(error, status, translate("invitation.error.respond"))
        })
    }
    const dismiss = () => {
        ApiClient.eventInvitationDelete(props.invitation.id, (data, status, error) => {
            if(!error)
            {
                sendCompleted()
            }
            ToastManager.showErrorToast(error, status, translate("invitation.error.respond"))
        })
    }
    const sendCompleted = () => {
        props.onCompleted(props.invitation.id)
    }
    const event = props.invitation.context_object as Event
    const avatar = eventAvatar(event)
    const link = event.uri || "#"
    const title = event.name
    const profile = ProfileManager.getProfileById(props.invitation.invited_by)
    const inviterName = userFullName(profile, null) || translate("Someone")
    const message = <><Link to={Routes.profileUrl(props.invitation.invited_by)}>{inviterName}</Link> {translate("invitation.invite.attend")}</>
    return <InvitationComponent avatarLink={link} createdAt={props.invitation.created_at} title={title} link={link} avatar={avatar} message={message}>
                <Button onClick={going} color="secondary" size="xs">{translate("invitation.going")}</Button>
                <Button outline={true} className="ml-1" onClick={notGoing} color="secondary" size="xs">{translate("invitation.not.going")}</Button>
                <Button outline={true} className="ml-1" onClick={dismiss} color="secondary" size="xs">{translate("invitation.dismiss")}</Button>
            </InvitationComponent>
}
type UnreadConversationProps = {
    conversation:Conversation
    authenticatedUser:UserProfile
    onCompleted:(id:number) => void
}
const UnreadConversation = (props:UnreadConversationProps) => {
    const markAsRead = () => {
        ApiClient.markConversationAsRead(props.conversation.id, (data, status, error) => {
            if(!error)
            {
                sendCompleted()
            }
            ToastManager.showErrorToast(error, status, translate("invitation.error.respond"))
        })
    }
    const sendCompleted = () => {
        props.onCompleted(props.conversation.id)
    }
    const time = (props.conversation.last_message && props.conversation.last_message.created_at) || props.conversation.updated_at
    const title = ConversationUtilities.getConversationTitle(props.conversation)
    const link = props.conversation.uri
    const avatar = ConversationUtilities.getAvatar(props.conversation, props.authenticatedUser.id)
    const message = props.conversation.last_message && <div className="text-truncate"><MessageContent message={props.conversation.last_message} simpleMode={true}/></div> || ""
    return <InvitationComponent avatarLink={link} createdAt={time} title={title} link={link} avatar={avatar} message={message}>
                <Button onClick={markAsRead} color="secondary" size="xs">{translate("notification.action.mark.read")}</Button>
            </InvitationComponent>
}
type StatusNotificationProps = {
    notification:StatusNotification
    onCompleted:(id:number) => void
}
const StatusNotificationComponent = (props:StatusNotificationProps) => {
    const markAsRead = () => {
        ApiClient.setStatusesRead([props.notification.id], (data, status, error) => {
            if(!error)
            {
                sendCompleted()
            }
            ToastManager.showErrorToast(error, status, translate("notification.error.respond"))
        })
    }
    const sendCompleted = () => {
        props.onCompleted(props.notification.id)
    }
    const getAction = () => {
        switch (props.notification.level) {
            case 0:return translate("status.action.status.new")
            case 1:return translate("status.action.status.comment")
            default:return translate("status.action.comment.comment")
        }
    }
    const profile = ProfileManager.getProfileById(props.notification.owner)
    const ownerName = userFullName(profile, null) || translate("Someone")
    const time = props.notification.created_at
    const title = <Link className="no-link" to={props.notification.uri}><span className="link-text">{ownerName}</span> {getAction()} <span className="link-text">{props.notification.context_object.name}</span></Link>
    const avatar = userAvatar(profile)
    const avatarLink = profile && profile.uri
    return <InvitationComponent avatarLink={avatarLink} createdAt={time} title={title} avatar={avatar}>
                <Button onClick={markAsRead} color="secondary" size="xs">{translate("notification.action.mark.read")}</Button>
            </InvitationComponent>
}
type AttentionProps = {
    notification:AttentionNotification
    onCompleted:(id:number) => void
    type:NotificationContextType
}
const AttentionComponent = (props:AttentionProps) => {
    const getEndpoint = () => {
        switch (props.type) {
            case NotificationContextType.TASK: return ApiClient.deleteTaskAttribute
            case NotificationContextType.STATUS: return ApiClient.deleteStatusAttribute
            default:return null
        }
    }
    const endpoint = getEndpoint()
    const setCompleted = () => {
        if(endpoint)
        {
            endpoint(props.notification.id, (data, status, error) => {
                if(!error)
                {
                    sendCompleted()
                }
                ToastManager.showErrorToast(error, status, translate("notification.error.respond"))
            })
        }
    }
    const sendCompleted = () => {
        props.onCompleted(props.notification.id)
    }
    const profile = ProfileManager.getProfileById(props.notification.created_by)
    const ownerName = userFullName(profile, null) || translate("Someone")
    const time = props.notification.created_at
    const action = translate(`notification.attention.${props.type}`)
    const title = <Link className="no-link" to={props.notification.uri}><span className="link-text">{ownerName}</span> {action}</Link>
    const avatar = userAvatar(profile)
    const avatarLink = profile && profile.uri
    const message = props.notification.message
    return <InvitationComponent message={message} avatarLink={avatarLink} createdAt={time} title={title} avatar={avatar}>
               {endpoint && <Button onClick={setCompleted} color="secondary" size="xs">{translate("notification.action.set.completed")}</Button>}
            </InvitationComponent>
}
type ReminderProps = {
    notification:ReminderNotification
    onCompleted:(id:number) => void
    type:NotificationContextType
}
const ReminderComponent = (props:ReminderProps) => {
    const getEndpoint = () => {
        switch (props.type) {
            case NotificationContextType.TASK: return ApiClient.deleteTaskAttribute
            case NotificationContextType.STATUS: return ApiClient.deleteStatusAttribute
            default:return null
        }
    }
    const endpoint = getEndpoint()
    const setCompleted = () => {
        if(endpoint)
        {
            endpoint(props.notification.id, (data, status, error) => {
                if(!error)
                {
                    sendCompleted()
                }
                ToastManager.showErrorToast(error, status, translate("notification.error.respond"))
            })
        }
    }
    const sendCompleted = () => {
        props.onCompleted(props.notification.id)
    }
    const time = props.notification.datetime
    const action = translate(`notification.reminder.${props.type}`)
    const title = <Link className="no-link" to={props.notification.uri}>{action}</Link>
    const style:React.CSSProperties = {width:Avatar.defaultProps.size, height:Avatar.defaultProps.size, borderRadius:"50%"}
    const avatar = <div className="primary-theme-bg d-flex justify-content-center align-items-center" style={style}>
                        <i className="fas fa-bell"></i>
                    </div>
    const avatarLink = props.notification.uri
    const message = props.notification.message
    return <InvitationComponent message={message} avatarLink={avatarLink} createdAt={time} title={title} avatar={avatar}>
               {endpoint && <Button onClick={setCompleted} color="secondary" size="xs">{translate("notification.action.set.completed")}</Button>}
            </InvitationComponent>
}
type OwnProps = {
    notificationKey:NotificationGroupKey
    value:any
    onNotificationCompleted:(id:number) => void
    authenticatedUser:UserProfile
}
type State = {

}
type Props = OwnProps

export default class NotificationItem extends React.Component<Props, State> {

    constructor(props:Props){
        super(props)
        this.state = {
            open:false,
        }

    }
    renderItem = () => {
        switch(this.props.notificationKey)
        {
            case NotificationGroupKey.GROUP_INVITATIONS:
                return <GroupInvitation invitation={this.props.value as InvitationNotification} onCompleted={this.props.onNotificationCompleted}  />
            case NotificationGroupKey.COMMUNITY_INVITATIONS:
                return <CommunityInvitation invitation={this.props.value as InvitationNotification} onCompleted={this.props.onNotificationCompleted}  />
            case NotificationGroupKey.EVENT_INVITATIONS:
                return <EventInvitation invitation={this.props.value as InvitationNotification} onCompleted={this.props.onNotificationCompleted}  />
            case NotificationGroupKey.FRIENDSHIP_INVITATIONS: 
                return <FriendshipInvitation invitation={this.props.value as InvitationNotification} onCompleted={this.props.onNotificationCompleted}  />
            case NotificationGroupKey.UNREAD_CONVERSATIONS:
                return <UnreadConversation authenticatedUser={this.props.authenticatedUser} conversation={this.props.value as Conversation} onCompleted={this.props.onNotificationCompleted}/>

            case NotificationGroupKey.STATUS_NOTIFICATIONS:
                return <StatusNotificationComponent notification={this.props.value as StatusNotification} onCompleted={this.props.onNotificationCompleted}/>
            case NotificationGroupKey.STATUS_ATTENTIONS:
                return <AttentionComponent type={NotificationContextType.STATUS} notification={this.props.value as AttentionNotification} onCompleted={this.props.onNotificationCompleted}/>
            case NotificationGroupKey.STATUS_REMINDERS:
                return <ReminderComponent type={NotificationContextType.STATUS} notification={this.props.value as ReminderNotification} onCompleted={this.props.onNotificationCompleted}/>
            
            case NotificationGroupKey.TASK_ATTENTIONS:
                    return <AttentionComponent type={NotificationContextType.TASK} notification={this.props.value as AttentionNotification} onCompleted={this.props.onNotificationCompleted}/>
            case NotificationGroupKey.TASK_REMINDERS:
                    return <ReminderComponent type={NotificationContextType.TASK} notification={this.props.value as ReminderNotification} onCompleted={this.props.onNotificationCompleted}/>
                default:return <div>Test</div>
        }
    }
    render() {
        const cn = classnames("notification-item");
        return(
            <div className={cn}>
                {this.renderItem()}
            </div>
        );
    }
}