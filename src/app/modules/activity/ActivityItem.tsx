import * as React from 'react'
import classnames from "classnames"
import "./ActivityItem.scss"
import { RecentActivity, UserProfile } from '../../types/intrasocial_types';
import { Link } from 'react-router-dom';
import Avatar from '../../components/general/Avatar';
import { ProfileManager } from '../../managers/ProfileManager';
import { userAvatar } from '../../utilities/Utilities';
import {ApiClient} from '../../network/ApiClient';
import { TimeComponent } from '../../components/general/TimeComponent';
import UserProfileAvatar from '../../components/general/UserProfileAvatar';

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
    handleActivityClick = (event:React.MouseEvent) => {
        if (event.nativeEvent.button == 2)
            event.preventDefault()
        this.setState({seen:true, read:true})
        ApiClient.markActivitiesAsRead([this.props.activity.id], () => {}) // Ignore response for now
    }
    fetchProfiles = () => {
        return ProfileManager.getProfiles(this.props.activity.actors)
    }
    getTimestamp = (createdAt:string) => {
        return <TimeComponent date={createdAt} />
    }
    render()
    {
        const {activity, className, children, ...rest} = this.props
        var cl = classnames("activity-list-item")
        if (!this.state.read) cl = cl.concat(" unread")
        if (!this.state.seen) cl = cl.concat(" unseen")
        const text = activity.display_text
        const profiles = this.fetchProfiles()
        return (<Link onClick={this.handleActivityClick} onContextMenuCapture={this.handleActivityClick} to={activity.uri || "#"} {...rest} className={cl}>
                    <div className="d-flex flex-row hover-card activity-content">
                        { profiles.length == 1 &&
                            <UserProfileAvatar size={40} profileId={profiles[0].id} borderColor="white" borderWidth={2}/>
                        ||
                            <Avatar images={profiles.slice(0,4).map((user) => {return user.avatar_thumbnail})} size={40} borderColor="white" borderWidth={2}/>
                        }
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