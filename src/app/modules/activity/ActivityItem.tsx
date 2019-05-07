import * as React from 'react'
import classnames from "classnames"
import "./ActivityItem.scss"
import { RecentActivity, UserProfile } from '../../types/intrasocial_types';
import { Link } from 'react-router-dom';
import { Avatar } from '../../components/general/Avatar';
import { ProfileManager } from '../../managers/ProfileManager';
import { userAvatar } from '../../utilities/Utilities';

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
            seen:false,
            read:false
        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        const ret =  nextProps.activity != this.props.activity ||
                     nextState.seen != this.state.seen ||
                     nextState.read != this.state.read
        return ret
    }
    handleActivityClick = (event:React.SyntheticEvent<any>) => {
        event.preventDefault()
        this.setState({seen:true, read:true})
    }
    fetchProfiles = () => {
        return ProfileManager.getProfiles(this.props.activity.actors)
    }
    renderAvatar= (profile:UserProfile) => {
        return(
            <Avatar key={profile.id} size={40} image={userAvatar(profile, true)} borderColor={"#FFFFFF"} borderWidth={2} />
        )
    }
    render()
    {
        const {activity, className, children, ...rest} = this.props
        const cl = classnames("activity-list-item")
        const text = activity.display_text
        const profiles = this.fetchProfiles()
        return (<Link key={activity.id} onClick={this.handleActivityClick} to={activity.uri} {...rest} className={cl}>
                    <div className="d-flex flex-row drop-shadow hover-card activity-content">
                        <div className="avatar-list">
                            {profiles.slice(0,2).map((profile) => {
                                return(this.renderAvatar(profile))
                            })}
                        </div>
                        <div className="text-muted activity-text">
                            {text}
                        </div>
                    </div>
                </Link>)
    }
}