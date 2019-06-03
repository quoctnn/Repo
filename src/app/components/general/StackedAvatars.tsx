import * as React from 'react';
import { connect } from 'react-redux'
import "./StackedAvatars.scss"
import { withRouter, RouteComponentProps, Link } from "react-router-dom";
import { ReduxState } from '../../redux';
import { Avatar } from './Avatar';
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
        borderWidth:2
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
    render() {
        let profiles = this.state.profiles
        return(
            <div className="avatar-stacked">
                {
                    !this.state.isLoading &&
                        profiles.slice(0,5).map((profile) => {
                        return(this.renderAvatar(profile))
                    })
                    ||
                    <LoadingSpinner/>
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