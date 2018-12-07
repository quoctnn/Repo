import * as React from "react";
import { Avatar } from "./Avatar";
import * as moment from 'moment-timezone';
import Moment from "react-moment";
import { translate } from "../intl/AutoIntlProvider";
import { UserProfile } from '../../types/intrasocial_types';
import { nullOrUndefined } from "../../utilities/Utilities";
import { ProfileManager } from '../../managers/ProfileManager';
require("./NotificationItem.scss");

export interface OwnProps
{
    text:string 
    date:string
    avatarProfiles:number[]
}
interface State
{
    avatarProfiles:UserProfile[]
}
type Props = OwnProps
export default class NotificationItem extends React.PureComponent<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            avatarProfiles:[]
        }
    }
    componentDidMount = () => 
    {
        ProfileManager.ensureProfilesExists(this.props.avatarProfiles, () => {
            this.setState({
                avatarProfiles: ProfileManager.getProfiles(this.props.avatarProfiles),
            });
        })
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
    render = () => 
    {
        const avatars = this.state.avatarProfiles.map(u => u.avatar_thumbnail || u.avatar).filter(a => !nullOrUndefined(a))
        return(
            <div className="panel-heading notification-item">
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