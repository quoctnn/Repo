import * as React from "react";
import classnames = require("classnames");
import { NotificationGroupKey, InvitationNotification, Community, Group, UserProfile, Event, Conversation, StatusNotification, AttentionNotification, ReminderNotification, TaskNotification, TaskNotificationAction, ReportResult, ReportNotification, MembershipRequestNotification, NotificationObject, ConversationNotification, ReviewNotification, Permission } from '../../types/intrasocial_types';
import {ApiClient} from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { translate, lazyTranslate } from '../../localization/AutoIntlProvider';
import { Button, Badge } from "reactstrap";
import { ListItem } from "../general/List";
import { ProfileManager } from '../../managers/ProfileManager';
import Avatar from "../general/Avatar";
import { userAvatar, userFullName, groupAvatar, communityAvatar, eventAvatar } from '../../utilities/Utilities';
import { Link } from 'react-router-dom';
import { TimeComponent } from "../general/TimeComponent";
import { ConversationUtilities } from '../../utilities/ConversationUtilities';
import { MessageContent } from "../../modules/conversation/MessageContent";
import authentication from "../../redux/authentication";

type NotificationEvents = {
    onCompleted: (key: NotificationGroupKey, id: number) => void
    onClose: () => void
}
type InvitationComponentProps = {
    link?: string
    avatar: React.ReactNode
    avatarLink?: string
    title: React.ReactNode
    children?: React.ReactNode
    message?: React.ReactNode
    createdAt: string
    onClose: () => void
}
const InvitationComponent = (props: InvitationComponentProps) => {

    const avt = typeof props.avatar == "string" ? <Avatar image={props.avatar} /> : props.avatar
    const avatar = !!props.avatarLink ? <Link onClick={props.onClose} to={props.avatarLink}>{avt}</Link> : avt
    const header = !!props.link ? <Link onClick={props.onClose} to={props.link} className="title">{props.title}</Link> : props.title
    return <ListItem className="invitation p-2" hasAction={true}>
        <div className="d-flex w-100">
            {avatar}
            <div className="primary-text profile d-flex flex-column flex-grow-1 ml-2 text-truncate">
                <div className="d-flex justify-content-between">
                    {header}
                    <div className="ml-1 small-text flex-shrink-0">
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
    invitation: InvitationNotification
} & NotificationEvents
const CommunityInvitation = (props: InvitationProps) => {
    const join = () => {
        ApiClient.communityInvitationAccept(props.invitation.id, (data, status, error) => {
            if (!error) {
                sendCompleted()
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("invitation.error.respond"))
        })
    }
    const dismiss = () => {
        ApiClient.communityInvitationDelete(props.invitation.id, (data, status, error) => {
            if (!error) {
                sendCompleted()
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("invitation.error.respond"))
        })
    }
    const sendCompleted = () => {
        props.onCompleted(props.invitation.type, props.invitation.id)
    }
    const community = props.invitation.context_object as Community
    const avatar = communityAvatar(community)
    const link = community.uri || "#"
    const title = community.name
    const profile = props.invitation.invited_by
    const inviterName = userFullName(profile, null) || translate("Someone")
    const message = <>
                    <Link onClick={props.onClose} to={profile.uri}>{inviterName}</Link> {translate("invitation.invite.join")}
                    {props.invitation.message && <div>{props.invitation.message}</div>}
                    </>
    return <InvitationComponent
                onClose={props.onClose}
                avatarLink={link}
                createdAt={props.invitation.created_at}
                title={title}
                link={link}
                avatar={avatar}
                message={message}>
        <Button onClick={join} color="secondary" size="xs">{translate("invitation.join")}</Button>
        <Button outline={true} className="ml-1" onClick={dismiss} color="secondary" size="xs">{translate("invitation.dismiss")}</Button>
    </InvitationComponent>
}
const GroupInvitation = (props: InvitationProps) => {
    const join = () => {
        ApiClient.groupInvitationAccept(props.invitation.id, (data, status, error) => {
            if (!error) {
                sendCompleted()
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("invitation.error.respond"))
        })
    }
    const dismiss = () => {
        ApiClient.groupInvitationDelete(props.invitation.id, (data, status, error) => {
            if (!error) {
                sendCompleted()
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("invitation.error.respond"))
        })
    }
    const sendCompleted = () => {
        props.onCompleted(props.invitation.type, props.invitation.id)
    }
    const group = props.invitation.context_object as Group
    const avatar = groupAvatar(group)
    const link = group.uri || "#"
    const title = group.name
    const profile = props.invitation.invited_by
    const inviterName = userFullName(profile, null) || translate("Someone")
    const message = <><Link onClick={props.onClose} to={profile.uri}>{inviterName}</Link> {translate("invitation.invite.join")}</>
    return <InvitationComponent onClose={props.onClose} avatarLink={link} createdAt={props.invitation.created_at} title={title} link={link} avatar={avatar} message={message}>
        <Button onClick={join} color="secondary" size="xs">{translate("invitation.join")}</Button>
        <Button outline={true} className="ml-1" onClick={dismiss} color="secondary" size="xs">{translate("invitation.dismiss")}</Button>
    </InvitationComponent>
}
const FriendshipInvitation = (props: InvitationProps) => {
    const accept = () => {
        ApiClient.friendInvitationAccept(props.invitation.invited_by.id, (data, status, error) => {
            if (!error) {
                sendCompleted()
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("invitation.error.respond"))
        })
    }
    const dismiss = () => {
        ApiClient.friendInvitationDelete(props.invitation.invited_by.id, false, (data, status, error) => {
            if (!error) {
                sendCompleted()
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("invitation.error.respond"))
        })
    }
    const block = () => {
        ApiClient.friendInvitationDelete(props.invitation.invited_by.id, true, (data, status, error) => {
            if (!error) {
                sendCompleted()
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("invitation.error.respond"))
        })
    }
    const sendCompleted = () => {
        props.onCompleted(props.invitation.type, props.invitation.id)
    }
    const profile = props.invitation.context_object as UserProfile
    const avatar = userAvatar(profile)
    const link = profile.uri || "#"
    const title = userFullName(profile, null) || translate("Someone")
    const message = props.invitation.message
    return <InvitationComponent onClose={props.onClose} avatarLink={link} createdAt={props.invitation.created_at} title={title} link={link} avatar={avatar} message={message}>
        <Button onClick={accept} color="secondary" size="xs">{translate("invitation.accept")}</Button>
        <Button outline={true} className="ml-1" onClick={dismiss} color="secondary" size="xs">{translate("invitation.dismiss")}</Button>
        <Button outline={true} className="ml-1" onClick={block} color="secondary" size="xs">{translate("invitation.block")}</Button>
    </InvitationComponent>
}
const EventInvitation = (props: InvitationProps) => {
    const going = () => {
        ApiClient.eventInvitationGoing(props.invitation.id, (data, status, error) => {
            if (!error) {
                sendCompleted()
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("invitation.error.respond"))
        })
    }
    const notGoing = () => {
        ApiClient.eventInvitationNotGoing(props.invitation.id, (data, status, error) => {
            if (!error) {
                sendCompleted()
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("invitation.error.respond"))
        })
    }
    const dismiss = () => {
        ApiClient.eventInvitationDelete(props.invitation.id, (data, status, error) => {
            if (!error) {
                sendCompleted()
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("invitation.error.respond"))
        })
    }
    const sendCompleted = () => {
        props.onCompleted(props.invitation.type, props.invitation.id)
    }
    const event = props.invitation.context_object as Event
    const avatar = eventAvatar(event)
    const link = event.uri || "#"
    const title = event.name
    const profile = props.invitation.invited_by
    const inviterName = userFullName(profile, null) || translate("Someone")
    const message = <><Link onClick={props.onClose} to={profile.uri}>{inviterName}</Link> {translate("invitation.invite.attend")}</>
    return <InvitationComponent onClose={props.onClose} avatarLink={link} createdAt={props.invitation.created_at} title={title} link={link} avatar={avatar} message={message}>
        <Button onClick={going} color="secondary" size="xs">{translate("invitation.going")}</Button>
        <Button outline={true} className="ml-1" onClick={notGoing} color="secondary" size="xs">{translate("invitation.not.going")}</Button>
        <Button outline={true} className="ml-1" onClick={dismiss} color="secondary" size="xs">{translate("invitation.dismiss")}</Button>
    </InvitationComponent>
}
type UnreadConversationProps = {
    conversation: ConversationNotification
    authenticatedUser: UserProfile
} & NotificationEvents
const UnreadConversation = (props: UnreadConversationProps) => {
    const markAsRead = () => {
        ApiClient.markConversationAsRead(props.conversation.id, (data, status, error) => {
            if (!error) {
                sendCompleted()
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("invitation.error.respond"))
        })
    }
    const sendCompleted = () => {
        props.onCompleted(props.conversation.type, props.conversation.id)
    }
    const time = (props.conversation.last_message && props.conversation.last_message.created_at) || props.conversation.updated_at
    const title = ConversationUtilities.getConversationTitle(props.conversation)
    const link = props.conversation.uri
    const avatar = ConversationUtilities.getAvatar(props.conversation, props.authenticatedUser.id, true)
    const message = props.conversation.last_message && <div className="text-truncate"><MessageContent message={props.conversation.last_message} simpleMode={true} /></div> || ""
    return <InvitationComponent onClose={props.onClose} avatarLink={link} createdAt={time} title={title} link={link} avatar={avatar} message={message}>
        <Button onClick={markAsRead} color="secondary" size="xs">{translate("notification.action.mark.read")}</Button>
    </InvitationComponent>
}
type StatusNotificationProps = {
    notification: StatusNotification
} & NotificationEvents
const StatusNotificationComponent = (props: StatusNotificationProps) => {
    const markAsRead = () => {
        ApiClient.setStatusesRead([props.notification.id], (data, status, error) => {
            if (!error) {
                sendCompleted()
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("notification.error.respond"))
        })
    }
    const sendCompleted = () => {
        props.onCompleted(props.notification.type, props.notification.id)
    }
    const getAction = () => {
        switch (props.notification.level) {
            case 0: return translate("status.action.status.new")
            case 1: return translate("status.action.status.comment")
            default: return translate("status.action.comment.comment")
        }
    }
    const profile = ProfileManager.getProfileById(props.notification.created_by)
    const ownerName = userFullName(profile, null) || translate("Someone")
    const time = props.notification.created_at
    const title = <Link onClick={props.onClose} className="no-link" to={props.notification.uri}><span className="link-text">{ownerName}</span> {getAction()} <span className="link-text">{props.notification.context_object.name}</span></Link>
    const avatar = userAvatar(profile)
    const avatarLink = profile && profile.uri
    return <InvitationComponent onClose={props.onClose} avatarLink={avatarLink} createdAt={time} title={title} avatar={avatar}>
        <Button onClick={markAsRead} color="secondary" size="xs">{translate("notification.action.mark.read")}</Button>
    </InvitationComponent>
}
type AttentionProps = {
    notification: AttentionNotification
} & NotificationEvents
const AttentionComponent = (props: AttentionProps) => {
    const getEndpoint = () => {
        switch (props.notification.type) {
            case NotificationGroupKey.TASK_ATTENTIONS: return ApiClient.deleteTaskAttribute
            case NotificationGroupKey.STATUS_ATTENTIONS: return ApiClient.deleteStatusAttribute
            default: return null
        }
    }
    const endpoint = getEndpoint()
    const setCompleted = () => {
        if (endpoint) {
            endpoint(props.notification.id, (data, status, error) => {
                if (!error) {
                    sendCompleted()
                }
                ToastManager.showRequestErrorToast(error, lazyTranslate("notification.error.respond"))
            })
        }
    }
    const sendCompleted = () => {
        props.onCompleted(props.notification.type, props.notification.id)
    }
    const profile = ProfileManager.getProfileById(props.notification.created_by)
    const ownerName = userFullName(profile, null) || translate("Someone")
    const time = props.notification.created_at
    const action = translate(`notification.attention.${props.notification.type}`)
    const title = <Link onClick={props.onClose} className="no-link" to={props.notification.uri}><span className="link-text">{ownerName}</span> {action}</Link>
    const avatar = userAvatar(profile)
    const avatarLink = profile && profile.uri
    const message = props.notification.message
    return <InvitationComponent onClose={props.onClose} message={message} avatarLink={avatarLink} createdAt={time} title={title} avatar={avatar}>
        {endpoint && <Button onClick={setCompleted} color="secondary" size="xs">{translate("notification.action.set.completed")}</Button>}
    </InvitationComponent>
}
type ReminderProps = {
    notification: ReminderNotification
} & NotificationEvents
const ReminderComponent = (props: ReminderProps) => {
    const getEndpoint = () => {
        switch (props.notification.type) {
            case NotificationGroupKey.TASK_REMINDERS: return ApiClient.deleteTaskAttribute
            case NotificationGroupKey.STATUS_REMINDERS: return ApiClient.deleteStatusAttribute
            default: return null
        }
    }
    const endpoint = getEndpoint()
    const setCompleted = () => {
        if (endpoint) {
            endpoint(props.notification.id, (data, status, error) => {
                if (!error) {
                    sendCompleted()
                }
                ToastManager.showRequestErrorToast(error, lazyTranslate("notification.error.respond"))
            })
        }
    }
    const sendCompleted = () => {
        props.onCompleted(props.notification.type, props.notification.id)
    }
    const time = props.notification.datetime
    const action = translate(`notification.reminder.${props.notification.type}`)
    const title = <Link onClick={props.onClose} className="no-link" to={props.notification.uri}>{action}</Link>
    const style: React.CSSProperties = { width: Avatar.WrappedComponent.defaultProps.size, height: Avatar.WrappedComponent.defaultProps.size, borderRadius: "50%" }
    const avatar = <div className="primary-theme-bg d-flex justify-content-center align-items-center" style={style}>
        <i className="fas fa-bell"></i>
    </div>
    const avatarLink = props.notification.uri
    const message = props.notification.message
    return <InvitationComponent onClose={props.onClose} message={message} avatarLink={avatarLink} createdAt={time} title={title} avatar={avatar}>
        {endpoint && <Button onClick={setCompleted} color="secondary" size="xs">{translate("notification.action.set.completed")}</Button>}
    </InvitationComponent>
}
type TaskNotificationProps = {
    notification: TaskNotification
} & NotificationEvents
const TaskNotificationComponent = (props: TaskNotificationProps) => {
    const markAsRead = () => {
        ApiClient.markTaskAsRead(props.notification.id, (data, status, error) => {
            if (!error) {
                sendCompleted()
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("notification.error.respond"))
        })
    }
    const sendCompleted = () => {
        props.onCompleted(props.notification.type, props.notification.id)
    }
    const getAction = () => {
        const action = props.notification.action || TaskNotificationAction.UPDATED
        return translate("task.action.task." + action)
    }
    const profile = ProfileManager.getProfileById(props.notification.created_by)
    const creatorName = userFullName(profile, null) || translate("Someone")
    const time = props.notification.created_at
    const title = <Link onClick={props.onClose} className="no-link" to={props.notification.uri}>
        <span className="link-text">{creatorName}</span>
        {" "}{getAction()}{" "}
        <span className="link-text">{props.notification.title}</span>
        {" "}{translate("task.in_project")}{" "}<span className="link-text">{props.notification.project.name}</span>
    </Link>
    const avatar = userAvatar(profile)
    const avatarLink = profile && profile.uri
    return <InvitationComponent onClose={props.onClose} avatarLink={avatarLink} createdAt={time} title={title} avatar={avatar}>
        <Button onClick={markAsRead} color="secondary" size="xs">{translate("notification.action.mark.read")}</Button>
    </InvitationComponent>
}
type ReviewContentNotificationProps = {
    notification: ReviewNotification
} & NotificationEvents
const ReviewContentComponent = (props: ReviewContentNotificationProps) => {
    const getAcceptEndpoint = () => {
        switch (props.notification.type) {
            case NotificationGroupKey.EVENT_UNDER_REVIEW: return ApiClient.eventReviewAccept
            case NotificationGroupKey.GROUP_UNDER_REVIEW: return ApiClient.groupReviewAccept
            case NotificationGroupKey.PROJECT_UNDER_REVIEW: return ApiClient.projectReviewAccept
            default: return null
        }
    }
    const getDismissEndpoint = () => {
        switch (props.notification.type) {
            case NotificationGroupKey.EVENT_UNDER_REVIEW: return ApiClient.eventReviewDelete
            case NotificationGroupKey.GROUP_UNDER_REVIEW: return ApiClient.groupReviewDelete
            case NotificationGroupKey.PROJECT_UNDER_REVIEW: return ApiClient.projectReviewDelete
            default: return null
        }
    }
    const acceptEndpoint = getAcceptEndpoint()
    const dismissEndpoint = getDismissEndpoint()
    const acceptRequest = () => {
        if (acceptEndpoint) {
            acceptEndpoint(props.notification.id, (data, status, error) => {
                if (!error) {
                    sendCompleted()
                }
                ToastManager.showRequestErrorToast(error, lazyTranslate("notification.error.respond"))
            })
        }
    }
    const dismissRequest = () => {
        if (dismissEndpoint) {
            dismissEndpoint(props.notification.id, (data, status, error) => {
                if (!error) {
                    sendCompleted()
                }
                ToastManager.showRequestErrorToast(error, lazyTranslate("notification.error.respond"))
            })
        }
    }
    const sendCompleted = () => {
        props.onCompleted(props.notification.type, props.notification.id)
    }
    const profile = props.notification.creator
    const creatorName = userFullName(profile, null) || translate("Someone")
    const time = props.notification.created_at
    const title = <Link onClick={props.onClose} className="no-link" to={profile.uri}>
        <span className="link-text">{creatorName}</span>
        {" "}{translate("review.action.submitted")}{" "}{props.notification.name}{" "}{translate("review.action.for_review")}
    </Link>
    const avatar = userAvatar(profile)
    const avatarLink = profile && profile.uri
    return <InvitationComponent onClose={props.onClose} avatarLink={avatarLink} createdAt={time} title={title} avatar={avatar}>
        {acceptEndpoint && props.notification.permission >= Permission.admin && <Button onClick={acceptRequest} color="secondary" size="xs">{translate("notification.action.accept")}</Button>}
        {dismissEndpoint && props.notification.permission >= Permission.admin && <Button outline={true} className="ml-1" onClick={dismissRequest} color="secondary" size="xs">{translate("invitation.dismiss")}</Button>}
    </InvitationComponent>
}
type ReportedContentNotificationProps = {
    notification: ReportNotification
} & NotificationEvents
const ReportedContentComponent = (props: ReportedContentNotificationProps) => {
    const profile = props.notification.creator
    const creatorName = userFullName(profile, null) || translate("Someone")
    const time = props.notification.created_at
    const title = <Link onClick={props.onClose} className="no-link" to={props.notification.uri}>
        <span className="link-text">{creatorName}</span>
        {" "}{translate("report.action.reported")}{" "}{translate("common.context_key.singular." + props.notification.context_natural_key)}
    </Link>
    const avatar = userAvatar(profile)
    const avatarLink = profile && profile.uri
    const message = props.notification.tags.map((t, i) => <Badge className={i > 0 ? "ml-1" : undefined} key={"tag_" + t} color="info">{translate("report.tag." + t)}</Badge>)
    return <InvitationComponent onClose={props.onClose} avatarLink={avatarLink} createdAt={time} title={title} avatar={avatar} message={message}>
    </InvitationComponent>
}
type MembershipRequestProps = {
    notification: MembershipRequestNotification
} & NotificationEvents
const MembershipRequestComponent = (props: MembershipRequestProps) => {
    const getAcceptEndpoint = () => {
        switch (props.notification.type) {
            case NotificationGroupKey.EVENT_REQUESTS: return ApiClient.eventMembershipRequestAccept
            case NotificationGroupKey.GROUP_REQUESTS: return ApiClient.groupMembershipRequestAccept
            case NotificationGroupKey.COMMUNITY_REQUESTS: return ApiClient.communityMembershipRequestAccept
            default: return null
        }
    }
    const getDismissEndpoint = () => {
        switch (props.notification.type) {
            case NotificationGroupKey.EVENT_REQUESTS: return ApiClient.eventMembershipRequestDelete
            case NotificationGroupKey.GROUP_REQUESTS: return ApiClient.groupMembershipRequestDelete
            case NotificationGroupKey.COMMUNITY_REQUESTS: return ApiClient.communityMembershipRequestDelete
            default: return null
        }
    }
    const acceptEndpoint = getAcceptEndpoint()
    const dismissEndpoint = getDismissEndpoint()
    const acceptRequest = () => {
        if (acceptEndpoint) {
            acceptEndpoint(props.notification.id, (data, status, error) => {
                if (!error) {
                    sendCompleted()
                }
                ToastManager.showRequestErrorToast(error, lazyTranslate("notification.error.respond"))
            })
        }
    }
    const dismissRequest = () => {
        if (dismissEndpoint) {
            dismissEndpoint(props.notification.id, (data, status, error) => {
                if (!error) {
                    sendCompleted()
                }
                ToastManager.showRequestErrorToast(error, lazyTranslate("notification.error.respond"))
            })
        }
    }
    const sendCompleted = () => {
        props.onCompleted(props.notification.type, props.notification.id)
    }
    const time = props.notification.created_at
    const requesterName = userFullName(props.notification.request_by, null) || translate("Someone")
    const contextName = props.notification.context_object.name
    const action = translate(`notification.membership.${props.notification.type}`)
    const title = <Link onClick={props.onClose} className="no-link" to={props.notification.context_object.uri}>
        <span className="link-text">{requesterName}</span>
        {" "}{action}{" "}
        <span className="link-text">{contextName}</span>
    </Link>
    const avatar = userAvatar(props.notification.request_by)
    const avatarLink = props.notification.request_by.uri
    return <InvitationComponent onClose={props.onClose} avatarLink={avatarLink} createdAt={time} title={title} avatar={avatar}>
        {acceptEndpoint && <Button onClick={acceptRequest} color="secondary" size="xs">{translate("notification.action.accept")}</Button>}
        {dismissEndpoint && <Button outline={true} className="ml-1" onClick={dismissRequest} color="secondary" size="xs">{translate("invitation.dismiss")}</Button>}
    </InvitationComponent>
}
/////////
type OwnProps = {
    value: NotificationObject
    authenticatedUser: UserProfile
} & NotificationEvents
type State = {

}
type Props = OwnProps

export default class NotificationItem extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            open: false,
        }

    }
    renderItem = () => {
        switch (this.props.value.type) {
            case NotificationGroupKey.GROUP_INVITATIONS:
                return <GroupInvitation onClose={this.props.onClose} invitation={this.props.value as InvitationNotification} onCompleted={this.props.onCompleted} />
            case NotificationGroupKey.COMMUNITY_INVITATIONS:
                return <CommunityInvitation onClose={this.props.onClose} invitation={this.props.value as InvitationNotification} onCompleted={this.props.onCompleted} />
            case NotificationGroupKey.EVENT_INVITATIONS:
                return <EventInvitation onClose={this.props.onClose} invitation={this.props.value as InvitationNotification} onCompleted={this.props.onCompleted} />
            case NotificationGroupKey.FRIENDSHIP_INVITATIONS:
                return <FriendshipInvitation onClose={this.props.onClose} invitation={this.props.value as InvitationNotification} onCompleted={this.props.onCompleted} />

            case NotificationGroupKey.UNREAD_CONVERSATIONS:
                return <UnreadConversation onClose={this.props.onClose} authenticatedUser={this.props.authenticatedUser} conversation={this.props.value as ConversationNotification} onCompleted={this.props.onCompleted} />

            case NotificationGroupKey.GROUP_UNDER_REVIEW:
                return <ReviewContentComponent onClose={this.props.onClose} notification={this.props.value as ReviewNotification} onCompleted={this.props.onCompleted} />
            case NotificationGroupKey.EVENT_UNDER_REVIEW:
                return <ReviewContentComponent onClose={this.props.onClose} notification={this.props.value as ReviewNotification} onCompleted={this.props.onCompleted} />
            case NotificationGroupKey.PROJECT_UNDER_REVIEW:
                return <ReviewContentComponent onClose={this.props.onClose} notification={this.props.value as ReviewNotification} onCompleted={this.props.onCompleted} />

            case NotificationGroupKey.REPORTED_CONTENT:
                return <ReportedContentComponent onClose={this.props.onClose} notification={this.props.value as ReportNotification} onCompleted={this.props.onCompleted} />

            case NotificationGroupKey.STATUS_NOTIFICATIONS:
                return <StatusNotificationComponent onClose={this.props.onClose} notification={this.props.value as StatusNotification} onCompleted={this.props.onCompleted} />
            case NotificationGroupKey.TASK_NOTIFICATIONS:
                return <TaskNotificationComponent onClose={this.props.onClose} notification={this.props.value as TaskNotification} onCompleted={this.props.onCompleted} />

            case NotificationGroupKey.TASK_ATTENTIONS:
            case NotificationGroupKey.STATUS_ATTENTIONS:
                return <AttentionComponent onClose={this.props.onClose} notification={this.props.value as AttentionNotification} onCompleted={this.props.onCompleted} />
            case NotificationGroupKey.TASK_REMINDERS:
            case NotificationGroupKey.STATUS_REMINDERS:
                return <ReminderComponent onClose={this.props.onClose} notification={this.props.value as ReminderNotification} onCompleted={this.props.onCompleted} />

            case NotificationGroupKey.COMMUNITY_REQUESTS:
            case NotificationGroupKey.GROUP_REQUESTS:
            case NotificationGroupKey.EVENT_REQUESTS:
                return <MembershipRequestComponent onClose={this.props.onClose} notification={this.props.value as MembershipRequestNotification} onCompleted={this.props.onCompleted} />
            default: return <div>Test</div>
        }
    }
    render() {
        const cn = classnames("notification-item");
        return (
            <div className={cn}>
                {this.renderItem()}
            </div>
        );
    }
}