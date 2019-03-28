import * as React from "react";
import "./PageTopNavigation.scss"
import { Avatar } from "./general/Avatar";
import { ReduxState } from "../redux";
import { connect } from 'react-redux'
import { UserProfile, Community } from '../types/intrasocial_types';
import { userFullName, userAvatar, communityAvatar } from "../utilities/Utilities";
import UserStatusSelector from "./general/UserStatusSelector";
import { translate } from "../localization/AutoIntlProvider";
export interface OwnProps 
{
}
interface ReduxStateProps 
{
    profile:UserProfile
    activeCommunity:number
    community:Community
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
        return(
            <div id="page-top-navigation" className="d-flex p-2 p-sm-3 p-md-4">
                <div className="flex-grow-0 left text-truncate">
                    <div className="community-box d-flex align-items-center mb-2">
                        <Avatar className="" image={communityAvatar(community)} size={70}/>
                        <div className="text-truncate ml-2 ">
                            <div className="community-name text-truncate">{ communityName }</div>
                        </div>
                    </div>
                    <div className="profile-box d-flex align-items-center">
                        <Avatar className="" image={userAvatar(profile)} size={60}/>
                        <div className="text-truncate ml-2 ">
                            <div className="profile-name text-truncate">{userFullName( profile ) }</div>
                            <UserStatusSelector />
                        </div>
                    </div>
                </div>
                <div className="flex-grow-1 right">
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
        const activeCommunity = state.activeCommunity.activeCommunity
        let community = state.communityStore.byId[activeCommunity]
        if(!community && state.communityStore.allIds.length > 0)
            community = state.communityStore.byId[state.communityStore.allIds[0]]
      return {
        profile:state.authentication.profile,
        community, 
        activeCommunity
      }
  }
  const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
      return {
    }
  }
  export default connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(PageTopNavigation)