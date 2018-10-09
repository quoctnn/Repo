import * as React from 'react';
import { UserProfile } from '../../../reducers/profileStore';
import { Status } from '../../../reducers/statuses';
import { translate } from '../../intl/AutoIntlProvider';
import * as moment from 'moment-timezone';
import Moment from "react-moment";
import {FormattedDate, FormattedTime} from "react-intl";
import { userFullName } from '../../../utilities/Utilities';
import { StatusUtilities } from '../../../utilities/StatusUtilities';
import { Avatar } from '../Avatar';
import { Link } from 'react-router-dom';
import { Routes } from '../../../utilities/Routes';
let timezone = moment.tz.guess();
require("./StatusHeader.scss");

export interface Props 
{
    owner:UserProfile
    created_at:string
    edited_at:string
    status:Status

    //
    addLinkToContext:boolean
    contextKey:string 
    contextId:number
}
interface State 
{
}
export default class StatusHeader extends React.Component<Props, State> {     
    constructor(props) {
        super(props);

        // Auto-binding
        this.getActionText = this.getActionText.bind(this);
        this.getScopeLinkElement = this.getScopeLinkElement.bind(this);

    }
    shouldComponentUpdate(nextProps:Props, nextState)
    {
        return nextProps.status.id != this.props.status.id || 
                nextProps.status.extra != this.props.status.extra || 
                nextProps.status.permission_set != this.props.status.permission_set || 
                nextProps.edited_at != this.props.edited_at || 
                nextProps.contextKey != this.props.contextKey || 
                nextProps.contextId != this.props.contextId || 
                nextProps.addLinkToContext != this.props.addLinkToContext
    }

    getActionText() {
        if (this.props.addLinkToContext) {
            let status = this.props.status;
            if(status.parent)
            {
                return (<span>
                            <span>{translate("replied to a ")}</span>
                            <a className="link link-text" href={StatusUtilities.getPermaLink(this.props.status.id)}>{translate("post")}</a> {translate("in ")}
                        </span>)
            }
            let contextKey = status.context_natural_key;
            if (contextKey == "auth.user") {
                if (status.owner.id == status.context_object_id) {
                    // Owner user profile
                    return "";
                }

                return translate("published on user")
            }

            if (contextKey == "group.group") {
                if (this.props.contextKey == contextKey && this.props.contextId == status.context_object_id) {
                    // Posted in this group
                    return "";
                }
                return translate("published on the group")
            }

            if (contextKey == "project.project") {
                return translate("published on the project")
            }

            if (contextKey == "project.task") {
                return translate("published on the task")
            }

            if (contextKey == "event.event") {
                if (typeof status.extra !== "undefined") {
                    let extraData = JSON.parse(status.extra);
                    if (extraData && extraData.created_status) {
                        return translate("created a new event")
                    }
                }
                return translate("published on the event")
            }


            return translate("published on")
        }
        return "";
    }
    getCommunityLinkElement() {

        let status = this.props.status;
        let contextKey = status.context_natural_key;
        if (!status.community || contextKey == "core.community") {
            return "";
        }
        else
        {
            let contextCommunity = status.community;
            if (this.props.addLinkToContext) {
                return <span>{translate("in ")}
                    <a className="link link-text"
                       href={contextCommunity.absolute_url}>{contextCommunity.name}</a>
                    </span>;
            }
        }
        return '';
    }
    getScopeLinkElement() {
        let status = this.props.status;
        let contextKey = status.context_natural_key;
        let contextId = status.context_object_id;
        let contextObj = status.context_object;

        if (this.props.addLinkToContext && contextObj != null) 
        {
            if (status.owner.id == contextId && contextKey == "auth.user") {
                // Owner user profile
                return "";
            }
            if (this.props.contextId == contextId && contextKey == "group.group") {
                // Posted in this group
                return "";
            }
            if (contextObj.absolute_url && contextObj.name) {
                return (
                    <a className="link link-text"
                       href={contextObj.absolute_url}>{contextObj.name}</a>);
            }
            if (contextObj.name) {
                return (<span>{contextObj.name}</span>);
            }
            return '[unknown]'
        }
    }

    getTimestamp() {
        // Get current date
        let current_date = new Date();
        // Add one minute to the current date to give some room for time inaccuracy
        let date = moment(current_date).add(1, 'm').toDate();
        // Date object for the post creation
        let created = new Date(this.props.created_at);
        if (isNaN(created.getTime())) {
            return translate("Publishing...")
        }
        else if (created <= date) {
            return <Moment interval={60000} fromNow date={created} />
        } else {
            return <Moment format='DD-MM-YYYY HH:mm' date={created} />
        }
    }

    getUserNames(users) {
        return users.map(function(user) {
            return user.first_name;
        }).join(", ");
    }

    renderEditedAt(date) {
        if (date) {
            let time = moment.utc(date).tz(timezone).date()
            return (
                <span className="edited-at">
                    {translate("edited")}{' '}
                    <FormattedDate value={time} />{' '}
                    <FormattedTime value={time} />
                </span>
            )
        }
    }

    render() {
        let fullName = userFullName(this.props.owner)
        let photoSrc = this.props.owner.avatar || this.props.owner.avatar_thumbnail

        return (
            <div className="panel-heading status-header">
                <Avatar image={photoSrc} />
                <p className="name secondary-text">
                    <Link className="user link-text" to={Routes.PROFILES + this.props.owner.slug_name}>{fullName}</Link>
                    <span className="action"> {this.getActionText()} </span>
                    <span>{this.getScopeLinkElement()} </span>
                    {this.getCommunityLinkElement()}
                    { this.props.status.created_at != null && this.props.status.permission_set == null &&
                        <span className="pull-right fa fa-globe" style={{ fontSize:"18px", color:"#999999"}}>
                        </span>
                    }
                    {   // Display permission set for debug
                        process.env.NODE_ENV != 'production' &&
                        this.props.status.created_at != null &&
                        this.props.status.permission_set != null &&
                        <span className="pull-right" style={{ fontSize:"14px", color:"#999999"}}>
                        {this.props.status.permission_set}
                        </span>
                    }
                    <br/>
                    <span className="date secondary-text">{this.getTimestamp()}</span>
                    {this.renderEditedAt(this.props.edited_at)}
                </p>
            </div>
        );
    }
}