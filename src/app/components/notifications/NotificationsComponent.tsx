import * as React from "react";
import classnames = require("classnames");
import "./NotificationsComponent.scss"
import {ApiClient} from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { translate } from "../../localization/AutoIntlProvider";
import { UnhandledNotifications, NotificationGroupKey, UserProfile, NotificationObject } from '../../types/intrasocial_types';
import NotificationGroup from "./NotificationGroup";
import { AuthenticationManager } from "../../managers/AuthenticationManager";
import { ReduxState } from "../../redux";
import { connect } from "react-redux";
import { nullOrUndefined } from "../../utilities/Utilities";
import { NotificationManager } from "../../managers/NotificationManager";

type OwnProps = {
    onClose:() => void
}
export type NotificationGroupAction = {
    title:string
    onPress?:() => void
}
type NotificationGroupObject = {
    key:string
    values:NotificationObject[]
    iconClassName?:string
    actions?:NotificationGroupAction[]
}
type State = {
    notifications:NotificationGroupObject[]
    open:{[key:string]:boolean}
}
type ReduxStateProps = {
    authenticatedUser:UserProfile
    unreadNotifications:number
}
type Props = OwnProps & ReduxStateProps

class NotificationsComponent extends React.Component<Props, State> {

    private collapsibleDefaultOpen = true
    private preventNextReload = false
    constructor(props:Props){
        super(props)
        this.state = {
            notifications:[],
            open:{}
        }
    }
    componentDidMount = () => {
        this.reloadNotifications()
    }
    componentWillUnmount = () => {
        NotificationManager.updateNotificationsCount()
    }
    componentDidUpdate = (prevProps:Props) => {
        if(this.preventNextReload)
        {
            this.preventNextReload = false 
            return
        }
        const currentCount = this.state.notifications.reduce((a, b) => a += b.values.length , 0)
        if(this.props.unreadNotifications != currentCount)
        {
            this.reloadNotifications()
        }
    }
    reloadNotifications = () => {
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
            const notifications = [...prevState.notifications]
            let found = false
            for (let i = 0; i < notifications.length; i++) {
                const values = notifications[i].values
                for (let j = 0; j < values.length; j++) {
                    const notification = values[j]
                    if(notification.id == id && notification.type == key)
                    {
                        found = true
                        values.splice(j, 1)
                        break;
                    }
                }
            }
            if(found)
            {
                this.preventNextReload = true
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
                    onClose={this.props.onClose}
                    toggleCollapse={this.toggleCollapseIndividualOpen(object.key)} 
                    title={object.key} 
                    values={object.values}
                    actions={object.actions} />
    }
    renderNotificationsList = () => {
        if(this.state.notifications.length == 0)
            return null
        return this.state.notifications.map(o => this.renderNotificationGroup(o))
    }
    sortDateDescending = (a:NotificationObject, b:NotificationObject) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    handleClearAllNotifications = () => {
        console.log("handleClearAllNotifications")
        ApiClient.readNotificationActions((data, status, error) => {
            //this.reloadNotifications()
        })
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
            list.push({key:translate("notification.group.reminders"), values:reminders.sort(this.sortDateDescending), iconClassName:"far fa-clock"})
        if(requestsAndInvitations.length > 0)
            list.push({key:translate("notification.group.requests_invitations"), values:requestsAndInvitations.sort(this.sortDateDescending), iconClassName:"fas fa-user-friends"})
        if(activity.length > 0)
        {
            list.push({
                key:translate("notification.group.activity"), 
                values:activity.sort(this.sortDateDescending), 
                iconClassName:"far fa-bell",
                actions:[{
                        title:translate("notification.read_all"),
                        onPress:this.handleClearAllNotifications
                    }]
            })
        }
        if(reports.length > 0)
            list.push({key:translate("notification.group.reports"), values:reports.sort(this.sortDateDescending), iconClassName:"far fa-flag"})
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
        authenticatedUser: AuthenticationManager.getAuthenticatedUser(),
        unreadNotifications:state.unreadNotifications.notifications

    }
}
export default connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(NotificationsComponent);