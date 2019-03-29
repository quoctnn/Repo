import * as React from "react";
import "./PageTopNavigation.scss"
import { Avatar } from "./general/Avatar";
import { ReduxState } from "../redux";
import { connect } from 'react-redux'
import { UserProfile, Community, UserStatus } from '../types/intrasocial_types';
import { userFullName, userAvatar, communityAvatar } from "../utilities/Utilities";
import UserStatusSelector from "./general/UserStatusSelector";
import { translate } from "../localization/AutoIntlProvider";
import PageMenu from "./PageMenu";
import { UserStatusIndicator } from "./general/UserStatusIndicator";
export interface OwnProps
{
    community:Community
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
        const community = this.props.community
        const communityName = (community && community.name) || translate("community.active.empty")
        const currentState = UserStatus.getObject(this.props.profile.user_status)
        return(
            <div id="page-top-navigation" className="d-flex">
                <div className="flex-grow-0 left text-truncate">
                    <div className="community-box d-flex align-items-center mb-2">
                        <Avatar className="" image={communityAvatar(community)} size={70}/>
                        <div className="text-truncate ml-2">
                            <div className="community-name text-truncate">{ communityName }</div>
                        </div>
                    </div>
                    <div className="profile-box d-flex align-items-center ml-1">
                        <Avatar className="" image={userAvatar(profile)} size={63} statusColor={currentState && currentState.color} >
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