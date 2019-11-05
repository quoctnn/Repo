import * as React from 'react';
import { UserProfile, UserStatus, AvatarStatusColor } from '../../types/intrasocial_types';
import { DispatchProp, connect } from 'react-redux';
import { ReduxState } from '../../redux/index';
import { ProfileManager } from '../../managers/ProfileManager';
import Avatar from './Avatar';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { UserStatusIndicator } from './UserStatusIndicator';
import "./UserProfileAvatar.scss"

type OwnProps = {
    profileId:number
    size?:number
    borderWidth?:number,
    borderColor?:string,
    innerRef?: (element:HTMLElement) => void
    containerClassName?:string
    forceUserStatus?:boolean
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
        forceUserStatus:false
    }
    constructor(props:Props)
    {
        super(props)
    }
    render() {
        const {authenticatedUser, dispatch, profileId, profile, forceUserStatus, children, ...rest} = this.props
        if (!profile) {
            return(
                <div className="user-profile-avatar">
                    <Avatar {... rest} image={null}>
                        {children}
                    </Avatar>
                </div>
            )
        }
        const image = profile.avatar_thumbnail
        const statusColor = UserStatus.getObject(profile.user_status)
        return(
            <div className="user-profile-avatar">
                { (this.props.authenticatedUser.id != profile.id || forceUserStatus) &&
                    <Avatar {... rest} image={image}>
                        { children }
                        { statusColor && statusColor.color != AvatarStatusColor.NONE &&
                            <UserStatusIndicator borderColor="white" statusColor={statusColor.color} borderWidth={1}/>
                        }
                    </Avatar>
                    ||
                    <Avatar {... rest} image={image}>
                        {children}
                    </Avatar>
                }
            </div>
        )
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