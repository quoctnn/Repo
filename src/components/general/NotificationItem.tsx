import * as React from "react";
import { Avatar } from "./Avatar";
import * as moment from 'moment-timezone';
import Moment from "react-moment";
import { translate } from "../intl/AutoIntlProvider";
import classNames = require("classnames");
require("./NotificationItem.scss");

export interface OwnProps
{
    text:string 
    date:string
    avatars:string[]
    id:string
    onItemClick?: (event:any, id:string) => void
    className?:string
}
interface State
{
}
type Props = OwnProps
export default class NotificationItem extends React.PureComponent<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    getTimestamp = () => 
    {
        // Get current date
        let current_date = new Date();
        // Add one minute to the current date to give some room for time inaccuracy
        let date = moment(current_date).add(1, 'm').toDate();
        // Date object for the post creation
        let created = new Date(this.props.date);
        if (isNaN(created.getTime())) {
            return translate("Unknown...")
        }
        else if (created <= date) {
            return <Moment interval={60000} fromNow date={created} />
        } else {
            return <Moment format='DD-MM-YYYY HH:mm' date={created} />
        }
    }
    onItemClick = (event:any) => {
        this.props.onItemClick(event, this.props.id)
    }
    render = () => 
    {
        const avatars = this.props.avatars
        const cn = classNames("panel-heading notification-item", this.props.className)
        return(
            <div className={cn} onClick={this.onItemClick}>
                <Avatar images={avatars} />
                <p className="name secondary-text">
                    <span className="user link-text">{this.props.text}</span>
                    <br/>
                    <span className="date secondary-text">{this.getTimestamp()}</span>
                </p>
            </div>
        );
    }
}