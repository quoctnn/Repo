import * as React from "react";
import classnames = require("classnames");
import CollapseComponent from "../general/CollapseComponent";
import NotificationItem from "./NotificationItem";
import { NotificationGroupKey, UserProfile, NotificationObject } from '../../types/intrasocial_types';
import { Badge, Button } from "reactstrap";
import { NotificationGroupAction } from "./NotificationsComponent";
import { translate } from '../../localization/AutoIntlProvider';

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
    more:boolean
}
type Props = OwnProps

export default class NotificationGroup extends React.Component<Props, State> {

    constructor(props:Props){
        super(props)
        this.state = {
            more:false
        }

    }
    getKey = (value:NotificationObject) => {
        return value.type + value.id
    }
    componentDidMount = () => {
        if (this.props.values.length > 5 && !this.state.more) {
            this.setState({more:true})
        }
    }
    handleAction = (callback?:() => void) => (e:React.SyntheticEvent) => {
        e.preventDefault()
        e.stopPropagation()
        callback && callback()
    }
    showAll = (e:React.MouseEvent) => {
        this.setState({more:false})
    }
    renderSlicedItems = (notifications:NotificationObject[], count?:number) => {
        if (count) {
            notifications = notifications.slice(0,count)
        }
        return notifications.map(v => <NotificationItem
                                                    authenticatedUser={this.props.authenticatedUser}
                                                    key={this.getKey(v)}
                                                    onClose={this.props.onClose}
                                                    onCompleted={this.props.onNotificationCompleted}
                                                    value={v} />)
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
                    {this.state.more &&
                        <>
                        {this.renderSlicedItems(this.props.values, 5)}
                        <button className="btn btn-xs btn-info more-button" onClick={this.showAll}>{translate("common.see.all")} ({this.props.values.length})</button>
                        </>
                    ||
                        <>
                        {this.renderSlicedItems(this.props.values)}
                    </>}
                </CollapseComponent>
            </div>
        );
    }
}