import * as React from "react";
import { Status, StatusActions } from '../types/intrasocial_types';
import { Avatar } from "./general/Avatar";
import { userAvatar, userFullName } from '../utilities/Utilities';
import classNames from 'classnames';
import Moment from "react-moment";
import * as moment from 'moment-timezone';
let timezone = moment.tz.guess();


import "./StatusComponent.scss"
import { translate } from "../localization/AutoIntlProvider";

interface OwnProps 
{
    onActionPress:(action:StatusActions, extra?:Object) => void
    bottomOptionsEnabled:boolean
    addLinkToContext:boolean
    canMention:boolean
    canComment:boolean
    canReact:boolean
    canUpload:boolean
    authorizedUserId:number
    status:Status
    className?:string
    isLastComment:boolean
}
type Props = OwnProps
export class StatusComponent extends React.Component<Props, {}> {
    
    getTimestamp = (createdAt:string) => {
        if (!createdAt) {
            return translate("Publishing...")
        }
        // Add one minute to the current date to give some room for time inaccuracy
        let created = moment.utc(createdAt).tz(timezone).toDate();
        let now = moment.utc().tz(timezone).toDate()
        if (created <= now) {
            return <Moment interval={60000} fromNow={true} date={created} />
        } else {
            return <Moment interval={60000} fromNow={true} date={now} />
        }
    }
    render() {
        const isComment = !!this.props.status.parent
        const contextObject =  isComment ? null : this.props.status.context_object
        const content = this.props.status.text
        const cn = classNames("status-component", this.props.className)
        return(
            <div className={cn}>
                <div className="d-flex text-truncate">
                    <div className="flex-shrink-0 header-left">
                        <Avatar image={userAvatar(this.props.status.owner)}/>
                    </div>
                    <div className="flex-grow-1 d-flex header-center text-truncate">
                        <div className="header-center-content text-truncate">
                            <div className="text-truncate">
                                <div className="title text-truncate">{userFullName(this.props.status.owner)}</div>
                            </div>
                            <div className="flex-grow-1 text-truncate">
                                <div className="date text-truncate secondary-text">{this.getTimestamp(this.props.status.created_at)}</div>
                            </div>
                        </div>
                        <div className="text-content">{content}</div>
                    </div>
                    <div className="header-right">
                        {contextObject && <div className="text-truncate context-container"><div className="context">{contextObject.name}</div></div>}
                    </div>
                </div>
                <div className="gallery"></div>
            </div>
        );
    }
}
