import * as React from "react";
import classnames = require("classnames");
import "./NotificationsComponent.scss"
import ApiClient from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { translate } from "../../localization/AutoIntlProvider";
import { UnhandledNotifications, NotificationGroupKey, InvitationNotification, UserProfile, NotificationObject } from '../../types/intrasocial_types';
import NotificationGroup from "./NotificationGroup";
import { AuthenticationManager } from "../../managers/AuthenticationManager";
import { ReduxState } from "../../redux";
import { connect } from "react-redux";
import { nullOrUndefined } from "../../utilities/Utilities";

type OwnProps = {

}
type NotificationGroupObject = {key:string, values:NotificationObject[], iconClassName?:string }
type State = {
    notifications:NotificationGroupObject[]
    open:{[key:string]:boolean}
}
type ReduxStateProps = {
    authenticatedUser:UserProfile
}
type Props = OwnProps & ReduxStateProps

class NotificationsComponent extends React.Component<Props, State> {

    private collapsibleDefaultOpen = true
    constructor(props:Props){
        super(props)
        this.state = {
            notifications:[],
            open:{}
        }

    }
    componentDidMount = () => {
        ApiClient.getNotifications((notifications, status, error) => {
            if(!!notifications)
            {
                const list = this.groupNotifications(notifications)
                this.setState((prevState:State) => {
                    return {notifications:list}
                })
            }
            ToastManager.showErrorToast(error, status, translate("notification.error.fetching"))
        })
    }
    toggleCollapseSingleOpen = (key:string) => () => {

        this.setState((prevState:State) => {

            let openStates = {...prevState.open}
            let open = openStates[key]
            if(open)
                return {open:{}}
            openStates = {}
            openStates[key] = true
            return {open:openStates}
        })
    }
    toggleCollapseIndividualOpen = (key:string) => () => {

        this.setState((prevState:State) => {

            let openStates = {...prevState.open}
            let open = openStates[key]
            if(nullOrUndefined(open) && this.collapsibleDefaultOpen)
                open = true
            openStates[key] = !open
            return {open:openStates}
        })
    }
    handleNotificationCompleted = (key:NotificationGroupKey, id:number) => {
        this.setState((prevState:State) => {
            const notifications = {...prevState.notifications}
            const content = notifications[key] as InvitationNotification[]
            const index = content.findIndex(c => c.id == id)
            if(index > -1)
            {
                content.splice(index, 1)
                return {notifications}
            }
            return
        })
    }
    renderNotificationGroup = (object:NotificationGroupObject) => {
        if(object.values.length == 0)
            return null
        let open = this.state.open[object.key]
        if(nullOrUndefined(open) && this.collapsibleDefaultOpen)
            open = true
        return <NotificationGroup 
                    iconClassName={object.iconClassName}
                    authenticatedUser={this.props.authenticatedUser} 
                    onNotificationCompleted={this.handleNotificationCompleted} 
                    key={object.key} 
                    open={open} 
                    toggleCollapse={this.toggleCollapseIndividualOpen(object.key)} 
                    title={object.key} 
                    values={object.values} />
    }
    renderNotificationsList = () => {
        if(this.state.notifications.length == 0)
            return null
        return this.state.notifications.map(o => this.renderNotificationGroup(o))
    }
    groupNotifications = (notifications:UnhandledNotifications):NotificationGroupObject[] => {
        const list:NotificationGroupObject[] = []
        const reminders:NotificationObject[] = []
        const requestsAndInvitations:NotificationObject[] = []
        const activity:NotificationObject[] = []
        const reports:NotificationObject[] = []

        const keys = Object.keys( notifications ) as NotificationGroupKey[]
        
        keys.forEach(k => {
            const values:NotificationObject[] = notifications[k]
            values.forEach(v => v.type = k)
            switch (k) {
                case NotificationGroupKey.TASK_REMINDERS:
                case NotificationGroupKey.TASK_ATTENTIONS:
                case NotificationGroupKey.STATUS_REMINDERS:
                case NotificationGroupKey.STATUS_ATTENTIONS:
                    reminders.push(...values)
                    break;
                case NotificationGroupKey.COMMUNITY_INVITATIONS:
                case NotificationGroupKey.GROUP_INVITATIONS:
                case NotificationGroupKey.EVENT_INVITATIONS:
                case NotificationGroupKey.FRIENDSHIP_INVITATIONS:
                case NotificationGroupKey.COMMUNITY_REQUESTS:
                case NotificationGroupKey.GROUP_REQUESTS:
                case NotificationGroupKey.EVENT_REQUESTS:
                    requestsAndInvitations.push(...values)
                    break;
                case NotificationGroupKey.STATUS_NOTIFICATIONS:
                case NotificationGroupKey.TASK_NOTIFICATIONS:
                case NotificationGroupKey.UNREAD_CONVERSATIONS:
                    activity.push(...values)
                    break;
                case NotificationGroupKey.REPORTED_CONTENT:
                    reports.push(...values)
                    break;
                default: break;
            }
        })
        if(reminders.length > 0)
            list.push({key:translate("notification.group.reminders"), values:reminders, iconClassName:"far fa-bell"})
        if(requestsAndInvitations.length > 0)
            list.push({key:translate("notification.group.requests_invitations"), values:requestsAndInvitations, iconClassName:"far fa-bell"})
        if(activity.length > 0)
            list.push({key:translate("notification.group.activity"), values:activity, iconClassName:"far fa-bell"})
        if(reports.length > 0)
            list.push({key:translate("notification.group.reports"), values:reports, iconClassName:"far fa-flag"})
        return list 
    }
    render() {
        const cn = classnames("notifications");
        return(
            <div id="notifications" className={cn}>
                {this.renderNotificationsList()}
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
    return {
        authenticatedUser: AuthenticationManager.getAuthenticatedUser()
    }
}
export default connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(NotificationsComponent);