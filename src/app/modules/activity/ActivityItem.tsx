import * as React from 'react'
import classnames from "classnames"
import "./ActivityItem.scss"
import { RecentActivity, UserProfile } from '../../types/intrasocial_types';
import { Link } from 'react-router-dom';
import { Avatar } from '../../components/general/Avatar';
import { ProfileManager } from '../../managers/ProfileManager';
import { userAvatar } from '../../utilities/Utilities';
import ApiClient from '../../network/ApiClient';
import Moment from 'react-moment';
import * as moment from 'moment-timezone';
let timezone = moment.tz.guess();

type OwnProps = {
    activity:RecentActivity
}
type State = {
    seen:boolean
    read:boolean
}
type Props = OwnProps & React.HTMLAttributes<HTMLElement>
export default class ActivityItem extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            seen:this.props.activity.is_seen,
            read:this.props.activity.is_read
        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        const ret =  nextProps.activity != this.props.activity ||
                     nextState.seen != this.state.seen ||
                     nextState.read != this.state.read
        return ret
    }
    handleActivityClick = (event:React.SyntheticEvent<any>) => {
        this.setState({seen:true, read:true})
        ApiClient.readActivity(this.props.activity.id, () => {}) // Ignore response for now
    }
    fetchProfiles = () => {
        return ProfileManager.getProfiles(this.props.activity.actors)
    }
    getTimestamp = (createdAt:string) => {
        let created = moment.utc(createdAt).tz(timezone).toDate();
        let now = moment.utc().tz(timezone).toDate()
        if (created <= now) {
            return <Moment interval={60000} fromNow={true} date={created} />
        } else {
            return <Moment interval={60000} fromNow={true} date={now} />
        }
    }
    renderAvatar= (profile:UserProfile) => {
        return(
            <Avatar key={profile.id} size={40} image={userAvatar(profile, true)} borderColor={"#FFFFFF"} borderWidth={2} />
        )
    }
    render()
    {
        const {activity, className, children, ...rest} = this.props
        var cl = classnames("activity-list-item")
        if (!this.state.read) cl = cl.concat(" unread")
        if (!this.state.seen) cl = cl.concat(" unseen")
        const text = activity.display_text
        const profiles = this.fetchProfiles()
        return (<Link key={activity.id} onClick={this.handleActivityClick} to={activity.uri || "#"} {...rest} className={cl}>
                    <div className="d-flex flex-row hover-card activity-content">
                        <div className="avatar-list">
                            {profiles.slice(0,2).map((profile) => {
                                return(this.renderAvatar(profile))
                            })}
                        </div>
                        <div>
                            <div className="text-truncate activity-text">
                                {text}
                            </div>
                            <div className="date text-truncate secondary-text">
                                {this.getTimestamp(this.props.activity.created_at)}
                            </div>
                        </div>
                    </div>
                </Link>)
    }
}