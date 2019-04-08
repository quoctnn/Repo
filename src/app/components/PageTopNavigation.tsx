import * as React from "react";
import "./PageTopNavigation.scss"
import { Avatar } from "./general/Avatar";
import { ReduxState } from "../redux";
import { connect } from 'react-redux'
import { UserProfile, UserStatus } from '../types/intrasocial_types';
import { userFullName, userAvatar } from "../utilities/Utilities";
import UserStatusSelector from "./general/UserStatusSelector";
import PageMenu from "./PageMenu";
export interface OwnProps
{
    primaryItemImage:string 
    primaryItemTitle:string
}
interface ReduxStateProps
{
    profile:UserProfile
}
interface ReduxDispatchProps
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class PageTopNavigation extends React.Component<Props, {}> {
    render() {
        const profile = this.props.profile
        const currentState = UserStatus.getObject(this.props.profile.user_status)
        return(
            <div id="page-top-navigation" className="d-flex">
                <div className="flex-grow-0 left text-truncate">
                    <div className="community-box d-flex align-items-center mb-2">
                        <Avatar className="" image={this.props.primaryItemImage} size={70}/>
                        <div className="text-truncate ml-2">
                            <div className="community-name text-truncate">{ this.props.primaryItemTitle }</div>
                        </div>
                    </div>
                    <div className="profile-box d-flex align-items-center ml-1">
                        <Avatar className="" image={userAvatar(profile, true)} size={63} statusColor={currentState && currentState.color} >
                        </Avatar>
                        <div className="text-truncate ml-2">
                            <div className="profile-name text-truncate">{userFullName( profile ) }</div>
                            <UserStatusSelector />
                        </div>
                    </div>
                    <PageMenu />
                </div>
                <div className="flex-grow-1 right">
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
      return {
        profile:state.authentication.profile,
      }
  }
  const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
      return {
    }
  }
  export default connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(PageTopNavigation)