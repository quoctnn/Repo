import * as React from 'react';
import { connect } from 'react-redux'
import "./StackedAvatars.scss"
import { withRouter, RouteComponentProps, Link } from "react-router-dom";
import { ReduxState } from '../../redux';
import Avatar from './Avatar';
import { UserProfile } from '../../types/intrasocial_types';
import { ProfileManager } from '../../managers/ProfileManager';
import { userAvatar } from '../../utilities/Utilities';
import LoadingSpinner from '../LoadingSpinner';

type OwnProps = {
    userIds: number[]
}
type DefaultProps = {
    size: number
    borderWidth:number
    maxAvatars:number
    showTotalCount:boolean
    showOverflowCount:boolean
    onOverflowCountClick?:() => void
}
type State = {
    isLoading:Boolean
    profiles:UserProfile[]
}
type ReduxStateProps = {
}
type ReduxDispatchProps = {
}
type Props = OwnProps & DefaultProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class StackedAvatars extends React.Component<Props, State> {
    static defaultProps:DefaultProps = {
        size:40,
        borderWidth:2,
        maxAvatars:5,
        showTotalCount:false,
        showOverflowCount:false
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            profiles:[]
        }
    }
    componentDidMount = () =>
    {
        this.setState({isLoading:true})
        ProfileManager.ensureProfilesExists(this.props.userIds, this.fetchProfiles)
    }
    componentDidUpdate = (prevProps:Props) =>
    {
        // New avatar detected?
        ProfileManager.ensureProfilesExists(this.props.userIds, this.fetchProfiles)
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) =>
    {
        return !this.props.userIds.isEqual(nextProps.userIds) ||
               !this.state.profiles.map(u => u.id).isEqual(nextState.profiles.map(u => u.id))
    }
    fetchProfiles = () =>
    {
        const profiles = ProfileManager.getProfiles(this.props.userIds)
        this.setState({profiles, isLoading:false})
    }
    renderAvatar = (profile:UserProfile) => {
        return(
            <Link key={profile.id} to={profile.uri}>
                <Avatar title={profile.first_name + " " + profile.last_name} size={this.props.size} image={userAvatar(profile, true)} borderColor={"#FFFFFF"} borderWidth={this.props.borderWidth} />
            </Link>
        )
    }
    renderAvatarCount = (count: string) => {
        return <div className="link" onClick={this.props.onOverflowCountClick} style={{position: "relative"}}>
                <Avatar size={this.props.size} borderColor={"#FFFFFF"} borderWidth={this.props.borderWidth} />
                <div className={"centered-text"}>{count}</div>
            </div>
    }
    render() {
        const {showOverflowCount, showTotalCount, onOverflowCountClick} = this.props
        const profiles = this.state.profiles
        if(profiles.length == 0)
            return null
        const max = this.props.maxAvatars
        const newMax = showOverflowCount && profiles.length > max ? max - 1 : max
        return(
            <div className="avatar-stacked">
                {showTotalCount &&
                    <div onClick={onOverflowCountClick} className="total link ml-1">{profiles.length}</div>
                }
                {
                    !this.state.isLoading &&
                        profiles.slice(0, newMax).map((profile) => {
                        return(this.renderAvatar(profile))
                    })
                    ||
                    <LoadingSpinner/>
                }
                {showOverflowCount && profiles.length > max &&
                    this.renderAvatarCount("+" + Math.min(profiles.length - newMax, 99))
                }
            </div>
        )
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
    return {
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}

export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(StackedAvatars))