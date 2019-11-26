import "intersection-observer"
import * as React from "react";
import { Route, Switch, withRouter, RouteComponentProps, Redirect, Link } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import Routes from "./utilities/Routes";
import { connect } from 'react-redux'
import { ReduxState } from "./redux";
import Signin from "./views/signin/Signin";
import { Error404 } from "./views/error/Error404";
import NewsfeedPage from "./components/pages/NewsfeedPage";
import { UserProfile } from './types/intrasocial_types';
import ApplicationLoader from "./views/loading/ApplicationLoader";
import Signout from "./views/signout/Signout";
import CommunityPage from "./components/pages/CommunityPage";
import DashboardPage from "./components/pages/DashboardPage";
import ProjectPage from "./components/pages/ProjectPage";
import TaskPage from "./components/pages/TaskPage";
import GroupPage from "./components/pages/GroupPage";
import ProfilePage from "./components/pages/ProfilePage";
import StatusPage from "./components/pages/StatusPage";
import { PrivateRoute } from "./components/router/PrivateRoute";
import { isAdmin, parseQueryString } from "./utilities/Utilities";
import EventPage from "./components/pages/EventPage";
import DashboardBuilderPage from "./components/pages/admin/DashboardBuilderPage";
import ConversationsPage from "./components/pages/ConversationsPage";
import { Changelog } from './components/Changelog';
import SimpleDialog from "./components/general/dialogs/SimpleDialog";
import { translate } from "./localization/AutoIntlProvider";
import TopNavigation from "./components/navigation/TopNavigation";
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import FilesPage from "./components/pages/FilesPage";
import DevToolPage from './components/pages/DevToolPage';
import SearchComponent from "./components/navigation/SearchComponent";
import CommunityCreateComponent from './components/general/contextCreation/CommunityCreateComponent';
import EventCreateComponent from "./components/general/contextCreation/EventCreateComponent";
import GroupCreateComponent from "./components/general/contextCreation/GroupCreateComponent";
import {  ContextDataResolver } from "./hoc/WithContextData";
import * as H from 'history';
import "./Main.scss"
import "./Overrides.scss"
import SideBarNavigation from "./components/navigation/sidebar/SideBarNavigation";

type PathLoaderProps = {

} & RouteComponentProps<any>
const WithSearch = () =>
    withRouter(class Modal extends React.Component<RouteComponentProps<any>, { visible: boolean, term:string, type:string }> {
        constructor(props: PathLoaderProps) {
            super(props)
            const dict = parseQueryString(props.location.search)
            const term = dict && dict["term"]
            const type = dict && dict["type"]
            this.state = {
                visible: true,
                term,
                type
            }
        }
        back = () => {
            const goBack = () => {
                setTimeout(this.props.history.goBack, 450)
            }
            this.setState(() => {
                return { visible: false }
            }, goBack)
        }
        render() {
            return <SearchComponent initialTerm={this.state.term} initialType={this.state.type} onClose={this.back} visible={this.state.visible}/>
        }
    })

const WithModal = (Component: any, title?: string) =>
    withRouter(class Modal extends React.Component<RouteComponentProps<any>, { visible: boolean }> {
        constructor(props: PathLoaderProps) {
            super(props)
            this.state = {
                visible: true
            }
        }
        back = () => {
            const goBack = () => {
                setTimeout(this.props.history.goBack, 450)
            }
            this.setState(() => {
                return { visible: false }
            }, goBack)
        }
        render() {
            const translated = translate(title)
            return <SimpleDialog visible={this.state.visible} didCancel={this.back} header={translated}>
                <Component />
            </SimpleDialog>
        }
    })

const ModalChangelog = WithModal(Changelog, "Changelog")
const ModalSearchComponent = WithSearch()


type OwnProps = {
}
type ReduxStateProps = {
    signedIn: boolean
    loaded: boolean
    profile: UserProfile
}
type ReduxDispatchProps = {
}
type State = {
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class Main extends React.Component<Props, State> {
    previousLocation: H.Location<any>
    constructor(props: Props) {
        super(props)
        this.state = {
            contextData:{
                loading:false, loaded:false
            },
            loadingPath:null,

        }
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        this.previousLocation = this.props.location;
    }
    componentDidMount = () => {
        window.routerHistory = this.props.history;
    }
    render() {
        const { profile, location } = this.props
        const userIsAdmin = isAdmin(profile)
        const modal = location.state && location.state.modal
        const currentLocation = modal ? this.previousLocation : location
        return (
            <div id="main">
                    <div id="main-content">
                        <ToastContainer />
                        <div id="hover-card"/>
                        <div id="content-block" className="">

                            {!this.props.loaded &&
                                <Switch>
                                    <Route path={Routes.ANY} component={ApplicationLoader} />
                                </Switch>
                            }
                            {this.props.loaded &&
                                <ContextDataResolver /*key={currentLocation.key}*/ location={currentLocation}>
                                    <DndProvider backend={HTML5Backend}>
                                        <TopNavigation />
                                        <SideBarNavigation />
                                        <Switch location={currentLocation}>
                                            {userIsAdmin &&
                                                <Route path={Routes.ADMIN_DASHBOARD_BUILDER.path} component={DashboardBuilderPage} />
                                            }
                                            <Redirect from={Routes.ELECTRON} to={Routes.ROOT} />
                                            <Route path={Routes.DEVELOPER_TOOL.path} component={DevToolPage} />
                                            <Route path={Routes.statusUrl(":statusid")} component={StatusPage} />
                                            <Route path={Routes.taskUrl(":communityname", ":projectname", ":taskid")} component={TaskPage} />
                                            <Route path={Routes.eventUrl(":communityname", ":eventname")} component={EventPage} exact={true} />
                                            <Route path={Routes.projectUrl(":communityname", ":projectname")} component={ProjectPage} exact={true} />
                                            <Route path={Routes.groupUrl(":communityname", ":groupname")} component={GroupPage} exact={true}  />
                                            <PrivateRoute path={Routes.profileUrl(":profilename")} component={ProfilePage} />
                                            <Route path={Routes.communityUrl(":communityname")} component={CommunityPage} exact={true} />
                                            <Route path={Routes.newsfeedUrl(":contextNaturalKey?", ":contextObjectId?")} component={NewsfeedPage} />
                                            <Route path={Routes.SIGNIN} component={Signin} />
                                            <Route path={Routes.SIGNUP} component={Error404} />
                                            <Route path={Routes.SIGNOUT} component={Signout} />
                                            <Route path={Routes.ROOT} exact={true} component={DashboardPage} />
                                            <Route path={Routes.conversationUrl(":conversationId?")} exact={true} component={ConversationsPage} />
                                            <Route path={Routes.FILES} exact={true} component={FilesPage} />
                                            <Route path={Routes.ELECTRON} component={DashboardPage} />
                                            <Route path={Routes.ANY} component={Error404} />
                                        </Switch>
                                        <Switch location={location}>
                                            <Route path={Routes.CHANGELOG} component={ModalChangelog} />
                                            <PrivateRoute path={Routes.SEARCH} component={ModalSearchComponent} />
                                            <PrivateRoute path={Routes.COMMUNITY_CREATE} component={CommunityCreateComponent} />
                                            <PrivateRoute path={Routes.EVENT_CREATE} component={EventCreateComponent} />
                                            <PrivateRoute path={Routes.GROUP_CREATE} component={GroupCreateComponent} />
                                        </Switch>
                                    </DndProvider>
                                </ContextDataResolver>
                            }
                        </div>
                    </div>
            </div>
        );
    }
}
const mapStateToProps = (state: ReduxState, ownProps: OwnProps): ReduxStateProps => {
    return {
        signedIn: state.authentication.signedIn,
        loaded: state.application.loaded,
        profile: state.authentication.profile
    }
}
const mapDispatchToProps = (dispatch: any, ownProps: OwnProps): ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(Main))