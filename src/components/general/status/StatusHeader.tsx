import * as React from 'react';
import { translate } from '../../intl/AutoIntlProvider';
import * as moment from 'moment-timezone';
import Moment from "react-moment";
import {FormattedDate, FormattedTime} from "react-intl";
import { Avatar } from '../Avatar';
import { UserProfile, Status, ContextNaturalKey, ICommunity } from '../../../types/intrasocial_types';
import { Settings } from '../../../utilities/Settings';
import { StatusActions } from './StatusComponent';
import Text from '../Text';
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
    isComment:boolean

    onActionPress:(action:StatusActions, extra?:Object) => void


    active_context_key?:string
    active_context_id?:number
    contextObjectName?:string
    context_natural_key?:string
    context_object_id?:number
    communityName?:string
    feedContextKey:string
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
            let time = moment.utc(date).tz(timezone).toDate()
            return (
                <span className="edited-at">
                    {' ('}{translate("edited")}{' '}
                    <FormattedDate value={time} />{' '}
                    <FormattedTime value={time} />{')'}
                </span>
            )
        }
    }
    getScopeLinkElement = () =>
    {
        let contextKey = this.props.context_natural_key
        let contextId = this.props.context_object_id

        if (this.props.addLinkToContext)
        {
            if (this.props.owner.id == contextId && contextKey == ContextNaturalKey.USER)
            {
                // Owner user profile
                return null
            }
            if (this.props.active_context_id == contextId && contextKey == ContextNaturalKey.GROUP && this.props.feedContextKey == contextKey) {
                // Posted in this group
                return null
            }
            if (this.props.contextObjectName) {
                return this.getLink(this.props.contextObjectName, StatusActions.context)
            }
            return "[unknown]"
        }
    }
    getLink = (text:string, key:StatusActions) => {
        return <Text key={key} onPress={() => this.props.onActionPress(key)}>{text}</Text>
    }
    getCommunityLinkElement = () =>
    {
        if (this.props.addLinkToContext)
        {
            let contextKey = this.props.context_natural_key
            if (!this.props.communityName || contextKey == ContextNaturalKey.COMMUNITY) {
                return null
            }
            else
            {
                return [translate("in "),this.getLink(this.props.communityName, StatusActions.community)]
            }
        }
        return null;
    }
    getActionText = () =>
    {
        let contextKey = this.props.context_natural_key
        if (contextKey == ContextNaturalKey.USER)
        {
            if (this.props.owner.id == this.props.context_object_id)
            {
                // Owner user profile
                return translate("published on his wall");
            }
            return translate("published on user")
        }
        if (contextKey == ContextNaturalKey.GROUP)
        {
            if (this.props.active_context_key == contextKey && this.props.active_context_id == this.props.context_object_id) {
                // Posted in this group
                return "";
            }
            return translate("published on the group")
        }
        if (contextKey == ContextNaturalKey.PROJECT) {
            return translate("published on the project")
        }
        if (contextKey == ContextNaturalKey.TASK) {
            return translate("published on the task")
        }
        if (contextKey == ContextNaturalKey.EVENT)
        {
            return translate("published on the event")
        }
        return translate("published on")
    }
    renderTitle = ():React.ReactElement<any> => {
        if(this.props.addLinkToContext)
        {
            let el = <Text>
                        {this.getLink(this.props.owner.first_name, StatusActions.user)}
                        {" "}{this.getActionText()}{" "}
                        {this.getScopeLinkElement()}{" "}{this.getCommunityLinkElement()}
                    </Text>
            return el
        }
        return this.getLink(this.props.owner.first_name, StatusActions.user)
    }
    render()
    {
        let photoSrc = this.props.owner.avatar || this.props.owner.avatar_thumbnail

        return (
            <div className="panel-heading status-header">
                <Avatar image={photoSrc} />
                <p className="name secondary-text">
                    {this.renderTitle()}
                    {!this.props.isComment && this.props.status.created_at != null && this.props.status.permission_set == null &&
                        <span className="float-right fa fa-globe" style={{ fontSize:"18px", color:"#999999"}}>
                        </span>
                    }
                    {   // Display permission set for debug
                        !Settings.isProduction &&
                        this.props.status.created_at != null &&
                        this.props.status.permission_set != null &&
                        <span className="float-right" style={{ fontSize:"14px", color:"#999999"}}>
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