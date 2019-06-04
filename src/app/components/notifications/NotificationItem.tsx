import * as React from "react";
import classnames = require("classnames");
import { NotificationGroupKey, Invitation, ContextNaturalKey, Community, Group, UserProfile, Event } from '../../types/intrasocial_types';
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

type InvitationComponentProps = {
    link:string
    avatar:string
    title:string
    children?:React.ReactNode
    message?:React.ReactNode
}
const InvitationComponent = (props:InvitationComponentProps) => {

    return <ListItem className="invitation p-2" hasAction={true}>
                <div className="d-flex w-100">
                    <Avatar image={props.avatar} />
                    <div className="primary-text profile d-flex flex-column flex-grow-1 ml-2">
                        <Link to={props.link} className="title">{props.title}</Link>
                        {props.message && <div className="secondary-text medium-small-text message mb-1">{props.message}</div>}
                        {props.children && <div className="d-flex">
                            {props.children}
                        </div>}
                    </div>
                </div>
            </ListItem>
}
type InvitationProps = {
    invitation:Invitation
    onCompleted:(invitationId:number) => void
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
    return <InvitationComponent title={title} link={link} avatar={avatar} message={message}>
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
    return <InvitationComponent title={title} link={link} avatar={avatar} message={message}>
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
    return <InvitationComponent title={title} link={link} avatar={avatar} message={message}>
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
    return <InvitationComponent title={title} link={link} avatar={avatar} message={message}>
                <Button onClick={going} color="secondary" size="xs">{translate("invitation.going")}</Button>
                <Button outline={true} className="ml-1" onClick={notGoing} color="secondary" size="xs">{translate("invitation.not.going")}</Button>
                <Button outline={true} className="ml-1" onClick={dismiss} color="secondary" size="xs">{translate("invitation.dismiss")}</Button>
            </InvitationComponent>
}
type OwnProps = {
    notificationKey:NotificationGroupKey
    value:any
    onInvitationCompleted:(invitationId:number) => void
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
    renderFriendshipInvitation = () => {
        const invitation = this.props.value as Invitation
        return 
    }
    renderItem = () => {
        switch(this.props.notificationKey)
        {
            case NotificationGroupKey.GROUP_INVITATIONS:
                    return <GroupInvitation invitation={this.props.value as Invitation} onCompleted={this.props.onInvitationCompleted}  />
            case NotificationGroupKey.COMMUNITY_INVITATIONS:
                    return <CommunityInvitation invitation={this.props.value as Invitation} onCompleted={this.props.onInvitationCompleted}  />
            case NotificationGroupKey.EVENT_INVITATIONS:
                    return <EventInvitation invitation={this.props.value as Invitation} onCompleted={this.props.onInvitationCompleted}  />
            case NotificationGroupKey.FRIENDSHIP_INVITATIONS: 
                return <FriendshipInvitation invitation={this.props.value as Invitation} onCompleted={this.props.onInvitationCompleted}  />
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