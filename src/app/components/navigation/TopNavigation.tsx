import * as React from "react";
import "./TopNavigation.scss"
import { ReduxState } from "../../redux";
import { UserProfile } from "../../types/intrasocial_types";
import { connect } from "react-redux";
import LogoSmall from "../general/images/LogoSmall";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";
import { Button, Badge, NavLink } from "reactstrap";
import SimpleDialog from "../general/dialogs/SimpleDialog";
import NotificationsComponent from "../notifications/NotificationsComponent";
import { translate } from "../../localization/AutoIntlProvider";
import { CommunityManager } from "../../managers/CommunityManager";
import { NavigationUtilities } from "../../utilities/NavigationUtilities";
import Routes from "../../utilities/Routes";
import UserMenu from "../UserMenu";
import classnames = require("classnames");

type OwnProps = {
}
type Props = OwnProps & ReduxStateProps & RouteComponentProps<any>

type ReduxStateProps = {
    profile: UserProfile
    unreadNotifications: number
    unreadConversations:number
}
type State = {
    notificationsPanelVisible:boolean
}
class TopNavigation extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props)
        this.state = {
            notificationsPanelVisible:false,
        }
    }
    navigateToCommunity = (event:React.SyntheticEvent<any>) => {
        event.preventDefault()
        const community = CommunityManager.getActiveCommunity()
        if(community)
        {
            NavigationUtilities.navigateToCommunity(this.props.history, community.id)
        }
    }
    toggleNotificationPanel = (e?:React.SyntheticEvent<any>) => {
        this.setState((prevState:State) => {
            return {notificationsPanelVisible:!prevState.notificationsPanelVisible}
        })
    }
    renderNotificationsPanel = () => {
        return <SimpleDialog className="notifications-modal" header={translate("Notifications")} visible={this.state.notificationsPanelVisible} didCancel={this.toggleNotificationPanel}>
                    <NotificationsComponent onClose={this.toggleNotificationPanel} />
                </SimpleDialog>
    }
    renderMenuLinks = () => {

        const profile = this.props.profile
        const path = this.props.location.pathname
        const community = CommunityManager.getActiveCommunity()
        const communityLink = community && Routes.communityUrl(community.slug_name) || "#"
        const dashboardLink = Routes.ROOT
        const conversationsLink = Routes.conversationUrl(null)
        const communityLinkClass = classnames("btn nav-link", {active:path.startsWith(communityLink)})
        const dashboardClass = classnames("btn nav-link", {active:path == dashboardLink})
        const conversationsLinkClass = classnames("btn nav-link", {active:path.startsWith(conversationsLink)})
        return <div className="flex-grow-1 d-flex justify-content-center">
                    <Link className={communityLinkClass} to={communityLink}>{translate("common.community")}</Link>
                    <Link className={dashboardClass} to={dashboardLink}>{translate("common.dashboard")}</Link>
                    { !profile.is_anonymous &&
                        <Link to={conversationsLink} className={conversationsLinkClass}>
                            {translate("common.messages")}
                            {this.props.unreadConversations > 0 && <Badge pill={true} color="danger" className="ml-1 badge-notification">{this.props.unreadConversations}</Badge>}
                        </Link>
                    }
                </div>
    }
    render() {
        const profile = this.props.profile
        return (
            <div id="top-navigation">
                <div className="top-navigation-content d-flex main-content-background align-items-center px-2 drop-shadow">
                    <Link to="/">
                        <LogoSmall className="logo" height={44} />
                    </Link>
                    <div className="main-border-color-background mx-2" style={{ width: 1, height: "75%" }}></div>
                    {this.renderMenuLinks()}
                    { !profile.is_anonymous &&
                        <Button onClick={this.toggleNotificationPanel} color="link" className="badge-notification-container">
                            <i className="fas fa-bell"></i>
                            {this.props.unreadNotifications > 0 && <Badge pill={true} color="danger" className="badge-notification">{this.props.unreadNotifications}</Badge>}
                        </Button>
                    }
                    <div className="main-border-color-background mx-2" style={{ width: 1, height: "75%" }}></div>
                    <div className="profile-box d-flex align-items-center">
                        <UserMenu />
                    </div>
                </div>
                {this.renderNotificationsPanel()}
            </div>
        );
    }
}
const mapStateToProps = (state: ReduxState, ownProps: OwnProps): ReduxStateProps => {
    return {
        profile: state.authentication.profile,
        unreadNotifications: state.unreadNotifications.notifications,
        unreadConversations:state.unreadNotifications.conversations
    }
}
export default withRouter(connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(TopNavigation))