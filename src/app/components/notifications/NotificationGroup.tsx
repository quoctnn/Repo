import * as React from "react";
import classnames = require("classnames");
import CollapseComponent from "../general/CollapseComponent";
import { translate } from '../../localization/AutoIntlProvider';
import NotificationItem from "./NotificationItem";
import { NotificationGroupKey, ContextNaturalKey, Invitation } from '../../types/intrasocial_types';
import { uniqueId } from '../../utilities/Utilities';

type OwnProps = {
    notificationKey:NotificationGroupKey
    values:any[]
    open:boolean
    toggleCollapse:() => void
    onInvitationCompleted:(invitationId:number) => void
}
type State = {

}
type Props = OwnProps

export default class NotificationGroup extends React.Component<Props, State> {

    constructor(props:Props){
        super(props)

    }
    getKey = (value:any) => {
        switch(this.props.notificationKey)
        {
            case NotificationGroupKey.GROUP_INVITATIONS:
            case NotificationGroupKey.COMMUNITY_INVITATIONS:
            case NotificationGroupKey.EVENT_INVITATIONS:
            case NotificationGroupKey.FRIENDSHIP_INVITATIONS: 
                return this.props.notificationKey + (value as Invitation).id
            default:return uniqueId()
        }
    }
    render() {
        const cn = classnames("notification-group", {active:this.props.open});
        return(
            <div className={cn}>
                <div className="d-flex" onClick={this.props.toggleCollapse}>
                    <div className="title text-truncate">{translate("notification." + this.props.notificationKey)}</div>
                </div>
                <CollapseComponent visible={this.props.open}>
                    {this.props.values.map(v => <NotificationItem key={this.getKey(v)} onInvitationCompleted={this.props.onInvitationCompleted} notificationKey={this.props.notificationKey} value={v} />)}
                </CollapseComponent>
            </div>
        );
    }
}