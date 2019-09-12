import * as React from "react";
import "./PageMainNavigation.scss"
import Avatar from "./general/Avatar";
import { ReduxState } from "../redux";
import { connect } from 'react-redux'
import { UserProfile } from '../types/intrasocial_types';
import { userFullName, userAvatar } from "../utilities/Utilities";
import UserStatusSelector from "./general/UserStatusSelector";
import PageMainMenu from "./PageMainMenu";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";
import Routes from "../utilities/Routes";
import { translate } from "../localization/AutoIntlProvider";
import { CommunityManager } from "../managers/CommunityManager";
import { NavigationUtilities } from "../utilities/NavigationUtilities";
import CommunitySelector from "./general/community/CommunitySelector";
import { Badge } from "reactstrap";
export interface OwnProps
{
    primaryItemImage:string
    primaryItemTitle:string
}
interface ReduxStateProps
{
    profile:UserProfile
    unreadConversations:number
}
interface ReduxDispatchProps
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class PageMainNavigation extends React.Component<Props, {}> {
    navigateToCommunity = (event:React.SyntheticEvent<any>) => {
        event.preventDefault()
        const community = CommunityManager.getActiveCommunity()
        if(community)
        {
            NavigationUtilities.navigateToCommunity(this.props.history, community.id)
        }
    }
    render() {
        const profile = this.props.profile
        if(!profile)
        {
            return
        }
        return(
            <div id="page-main-navigation" className="">
                <div className="d-flex">
                    <div className="flex-grow-0 left text-truncate">
                        <div className="community-box d-flex align-items-center mb-2">
                            <Avatar className="" image={this.props.primaryItemImage} size={70}/>
                            <div className="d-flex text-truncate ml-2">
                                <div className="community-name text-truncate">{ this.props.primaryItemTitle }</div>
                                <CommunitySelector />
                            </div>
                        </div>
                    </div>
                    <div className="center flex-grow-1 d-flex">
                        
                    </div>
                </div>
                <div className="menu-row" >
                    <PageMainMenu className="d-flex justify-content-center align-items-end" style={{gridArea: "1 / 1 / span 1 / span 3"}}/>
                    <div className="center flex-grow-1 d-flex justify-content-around align-items-end" style={{gridArea: "1 / 4 / span 1 / span 6"}}>
                        <a className="btn" onClick={this.navigateToCommunity} href="#">{translate("common.core.community")}</a>
                        <Link className="btn" to={Routes.ROOT}>{translate("common.dashboard")}</Link>
                        { !profile.is_anonymous &&
                            <Link to={Routes.conversationUrl(null)} className="btn">
                                {translate("common.messages")}
                                {this.props.unreadConversations > 0 && <Badge pill={true} color="danger" className="ml-1 badge-notification">{this.props.unreadConversations}</Badge>}
                            </Link>
                        }
                    </div>
                    <div className="right" style={{gridArea: "1 / 10 / span 1 / span 3"}}>
                        <div className="profile-box d-flex align-items-center mr-1  flex-row-reverse">
                            <Avatar image={userAvatar(profile, true)} size={63} userStatus={profile.id} >
                            </Avatar>
                            <div className="text-truncate mr-2">
                                <div className="profile-name text-truncate">{userFullName( profile ) }</div>
                                <UserStatusSelector />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
      return {
        profile:state.authentication.profile,
        unreadConversations:state.unreadNotifications.conversations
      }
  }
  const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
      return {
    }
  }
  export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(PageMainNavigation))