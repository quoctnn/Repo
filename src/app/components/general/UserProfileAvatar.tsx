import * as React from 'react';
import { UserProfile, UserStatus } from '../../types/intrasocial_types';
import { DispatchProp, connect } from 'react-redux';
import { ReduxState } from '../../redux/index';
import { ProfileManager } from '../../managers/ProfileManager';
import Avatar from './Avatar';
import { AuthenticationManager } from '../../managers/AuthenticationManager';

type OwnProps = {
    profileId:number
    userStatus?:boolean
    size?:number
    borderWidth?:number,
    borderColor?:string,
    innerRef?: (element:HTMLElement) => void
    containerClassName?:string
}
type ReduxStateProps = {
    authenticatedUser?:UserProfile,
    profile?:UserProfile,
}
type DefaultProps = ReduxStateProps & OwnProps
type Props = DefaultProps & DispatchProp
class UserProfileAvatar extends React.PureComponent<Props & React.HTMLAttributes<HTMLElement>, {}> {
    static defaultProps:DefaultProps = {
        profileId:null,
        userStatus:false
    }
    constructor(props:Props)
    {
        super(props)
    }
    render() {
        const {profileId, profile, userStatus, children, ...rest} = this.props
        const image = profile.avatar_thumbnail
        const statusColor = UserStatus.getObject(profile.user_status)
        return(<>
            { this.props.authenticatedUser.id != profile.id &&
                <Avatar {... rest} image={image} statusColor={statusColor.color}>
                    {children}
                </Avatar>
                ||
                <Avatar {... rest} image={image}>
                    {children}
                </Avatar>
            }
        </>)
    }
}
const mapStateToProps = (state: ReduxState, ownProps: OwnProps): ReduxStateProps => {
    const authenticatedUser = AuthenticationManager.getAuthenticatedUser()
    if(ownProps.profileId)
    {
        const profile = ProfileManager.getProfileById(ownProps.profileId)
        return {authenticatedUser, profile}
    }
    return {authenticatedUser}
}
export default connect<ReduxStateProps, DispatchProp, OwnProps>(mapStateToProps, null)(UserProfileAvatar)