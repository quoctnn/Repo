import * as React from "react";
import classnames = require("classnames");
import CollapseComponent from "../general/CollapseComponent";
import NotificationItem from "./NotificationItem";
import { NotificationGroupKey, UserProfile, NotificationObject } from '../../types/intrasocial_types';
import { Badge, Button } from "reactstrap";
import { NotificationGroupAction } from "./NotificationsComponent";

type OwnProps = {
    values:NotificationObject[]
    actions?:NotificationGroupAction[]
    open:boolean
    toggleCollapse:() => void
    onNotificationCompleted:(key:NotificationGroupKey, id:number) => void
    authenticatedUser:UserProfile
    title:string
    iconClassName?:string
    onClose:() => void
}
type State = {

}
type Props = OwnProps

export default class NotificationGroup extends React.Component<Props, State> {

    constructor(props:Props){
        super(props)

    }
    getKey = (value:NotificationObject) => {
        return value.type + value.id
    }
    handleAction = (callback?:() => void) => (e:React.SyntheticEvent) => {
        e.preventDefault()
        e.stopPropagation()
        callback && callback()
    }
    render() {
        const cn = classnames("notification-group", {active:this.props.open});

        return(
            <div className={cn}>
                <div className="d-flex header main-content-secondary-background justify-content-between align-items-center" onClick={this.props.toggleCollapse}>
                    <div className="title text-truncate flex-grow-1">
                        {this.props.iconClassName && <i className={this.props.iconClassName + " mr-2"}></i>}
                        {this.props.title}
                    </div>
                    {this.props.actions && this.props.actions.map(action => {
                        return <Button color="secondary" className="mr-1" size="xs" key={action.title} onClick={this.handleAction(action.onPress)}>{action.title}</Button>
                    })}
                    <Badge color="warning" pill={true}>{this.props.values.length}</Badge>
                </div>
                <CollapseComponent className="content" visible={this.props.open}>
                    {this.props.values.map(v => <NotificationItem
                                                    authenticatedUser={this.props.authenticatedUser}
                                                    key={this.getKey(v)}
                                                    onClose={this.props.onClose}
                                                    onCompleted={this.props.onNotificationCompleted}
                                                    value={v} />)}
                </CollapseComponent>
            </div>
        );
    }
}