import * as React from "react";
import "./TopNavigation.scss"
import { ReduxState } from "../../redux";
import { UserProfile} from '../../types/intrasocial_types';
import { connect } from "react-redux";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";
import { Button, Badge } from "reactstrap";
import SimpleDialog from "../general/dialogs/SimpleDialog";
import NotificationsComponent from "../notifications/NotificationsComponent";
import { translate } from "../../localization/AutoIntlProvider";
import { CommunityManager } from "../../managers/CommunityManager";
import { NavigationUtilities } from "../../utilities/NavigationUtilities";
import Routes from "../../utilities/Routes";
import UserMenu from "../UserMenu";
import classnames = require("classnames");
import BreadcrumbNavigation from "./BreadcrumbNavigation";
import Logo from "../general/images/Logo";
import { EventSubscription } from "fbemitter";
import { FontSizeAdjuster } from '../general/FontSizeAdjuster';
import LogoSmall from "../general/images/LogoSmall";
import MobileNavigation from "./sidebar/mobile/MobileNavigation";

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
    sideMenuOpen:boolean
}
class TopNavigation extends React.Component<Props, State> {
    observers:EventSubscription[] = []
    constructor(props:Props) {
        super(props)
        this.state = {
            notificationsPanelVisible:false,
            sideMenuOpen:false
        }
    }
    componentWillUnmount() {
        this.observers.forEach(o => o.remove())
        this.observers = null
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
    toggleSideMenu = (e?:React.SyntheticEvent<any>) => {
        this.setState((prevState:State) => {
            return {sideMenuOpen:!prevState.sideMenuOpen}
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
        const communityLinkClass = classnames("btn nav-link d-flex align-items-center mw0", {active:path.startsWith(communityLink)})
        const dashboardClass = classnames("btn nav-link d-flex align-items-center mw0", {active:path == dashboardLink})
        const conversationsLinkClass = classnames("btn nav-link d-flex align-items-center mw0", {active:path.startsWith(conversationsLink)})
        return <div className="d-flex justify-content-center mw0">
                    { profile && !profile.is_anonymous &&
                        <>
                            <Link className={communityLinkClass} to={communityLink} title={translate("common.core.community")}>
                                <i className="fa fa-globe" />
                                <div className="hide-narrow text-truncate">{translate("common.core.community")}</div>
                            </Link>
                            <Link className={dashboardClass} to={dashboardLink} title={translate("common.dashboard")}>
                                <i className="fa fa-tachometer-alt" />
                                <div className="hide-narrow text-truncate">{translate("common.dashboard")}</div>
                            </Link>
                            <Link to={conversationsLink} className={conversationsLinkClass} title={translate("common.messages")}>
                                <i className="fa fa-comment" />
                                <div className="hide-narrow text-truncate">{translate("common.messages")}</div>
                                {this.props.unreadConversations > 0 && <Badge pill={true} color="danger" className="ml-1 badge-notification">{this.props.unreadConversations}</Badge>}
                            </Link>
                        </>
                        ||
                        <Link to={dashboardLink}><Logo idPrefix="top_nav" className="logo" progress={0} /></Link>
                    }
                </div>
    }
    renderMobileMenu = () => {
        return <>
            <div className="mobile-menu-icon" title={translate("Menu")} onClick={this.toggleSideMenu}>
                <i className="fa fa-2x fa-bars"></i>
            </div>
            <MobileNavigation visible={this.state.sideMenuOpen} hideMenu={() => {this.setState({sideMenuOpen:false})}}/>
        </>
    }
    goBack = (e:React.MouseEvent) => {
        window.history.back()
    }
    renderFontSizeAdjuster = () => {
        return <FontSizeAdjuster />
    }
    render() {
        const profile = this.props.profile
        return (
            <div id="top-navigation">
                <div className="top-navigation-content d-flex main-content-background align-items-center px-2 drop-shadow">
                    { window.isElectron  &&
                        <i className='fa fa-lg fa-chevron-left navigation-back' onClick={this.goBack} title={translate("common.back")}></i>
                    }
                    {this.renderMobileMenu()}
                    <Link to={Routes.ROOT}><LogoSmall className="intrawork-logo-small" /></Link>
                    <div className="main-border-color-background mx-2" style={{ width: 1, height: "75%" }}></div>
                    <BreadcrumbNavigation />
                    {this.renderMenuLinks()}
                    <div className="profile-shortcuts">
                        {this.renderFontSizeAdjuster()}
                        { profile && !profile.is_anonymous && <>
                                <Button onClick={this.toggleNotificationPanel} color="link" className="badge-notification-container">
                                    <i className="fas fa-bell"></i>
                                    {this.props.unreadNotifications > 0 && <Badge pill={true} color="danger" className="badge-notification">{this.props.unreadNotifications}</Badge>}
                                </Button>
                                <Link className="btn btn-link" to={{pathname:Routes.SEARCH, state:{modal:true}}}>
                                    <i className="fas fa-search"></i>
                                </Link></>
                        }
                    </div>
                    <div className="main-border-color-background mx-2" style={{ width: 1, height: "75%" }}></div>
                    <UserMenu />
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