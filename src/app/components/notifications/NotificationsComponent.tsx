import * as React from "react";
import classnames = require("classnames");
import "./NotificationsComponent.scss"
import ApiClient from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { translate } from "../../localization/AutoIntlProvider";
import { UnhandledNotifications, NotificationGroupKey, ContextNaturalKey, Invitation } from '../../types/intrasocial_types';
import NotificationGroup from "./NotificationGroup";

type OwnProps = {

}
type State = {
    notifications:UnhandledNotifications
    open:{[key:string]:boolean}
}
type Props = OwnProps

export default class NotificationsComponent extends React.Component<Props, State> {

    constructor(props:Props){
        super(props)
        this.state = {
            notifications:null,
            open:{}
        }

    }
    componentDidMount = () => {
        ApiClient.getNotifications((notifications, status, error) => {
            if(!!notifications)
            {
                this.setState((prevState:State) => {
                    return {notifications}
                })
            }
            ToastManager.showErrorToast(error, status, translate("notification.error.fetching"))
        })
    }
    toggleCollapse = (key:string) => () => {

        this.setState((prevState:State) => {

            let openStates = {...prevState.open}
            const open = openStates[key]
            if(open)
                return {open:{}}
            openStates = {}
            openStates[key] = true
            return {open:openStates}
        })
    }

    handleInvitationCompleted = (key:NotificationGroupKey) => (invitationId:number) => {
        this.setState((prevState:State) => {
            const notifications = {...prevState.notifications}
            const content = notifications[key] as Invitation[]
            const index = content.findIndex(c => c.id == invitationId)
            if(index > -1)
            {
                content.splice(index, 1)
                return {notifications}
            }
            return
        })
    }
    renderNotificationGroup = (group:{key:string, value:any[]}) => {
        if(group.value.length == 0)
            return null
        const open = this.state.open[group.key]
        const key = group.key as NotificationGroupKey
        return <NotificationGroup onInvitationCompleted={this.handleInvitationCompleted(key)} key={key} open={open} toggleCollapse={this.toggleCollapse(group.key)} notificationKey={key} values={group.value} />
    }
    renderNotificationsList = () => {
        if(!this.state.notifications)
            return null
        const keys = Object.keys( this.state.notifications )
        const objects = keys.map(k => {
            return {key:k, value:this.state.notifications[k]}
        })
        return objects.map(o => this.renderNotificationGroup(o))
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