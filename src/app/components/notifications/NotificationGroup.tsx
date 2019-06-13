import * as React from "react";
import classnames = require("classnames");
import CollapseComponent from "../general/CollapseComponent";
import { translate } from '../../localization/AutoIntlProvider';
import NotificationItem from "./NotificationItem";
import { NotificationGroupKey, UserProfile, NotificationObject } from '../../types/intrasocial_types';
import { Badge } from "reactstrap";

type OwnProps = {
    values:NotificationObject[]
    open:boolean
    toggleCollapse:() => void
    onNotificationCompleted:(key:NotificationGroupKey, id:number) => void
    authenticatedUser:UserProfile
    title:string
    iconClassName?:string
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
    render() {
        const cn = classnames("notification-group", {active:this.props.open});

        return(
            <div className={cn}>
                <div className="d-flex header main-content-secondary-background justify-content-between align-items-center" onClick={this.props.toggleCollapse}>
                    <div className="title text-truncate">
                        {this.props.iconClassName && <i className={this.props.iconClassName}></i>}
                        {this.props.title}
                    </div>
                    <Badge color="warning" pill={true}>{this.props.values.length}</Badge>
                </div>
                <CollapseComponent className="content" visible={this.props.open}>
                    {this.props.values.map(v => <NotificationItem 
                                                    authenticatedUser={this.props.authenticatedUser} 
                                                    key={this.getKey(v)} 
                                                    onNotificationCompleted={this.props.onNotificationCompleted} 
                                                    value={v} />)}
                </CollapseComponent>
            </div>
        );
    }
}