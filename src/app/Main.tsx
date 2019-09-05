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
import { Dashboard, UserProfile } from './types/intrasocial_types';
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
import { ContextManager } from "./managers/ContextManager";
import LoadingSpinner from "./components/LoadingSpinner";
import { CommunityManager } from "./managers/CommunityManager";
import ConversationsPage from "./components/pages/ConversationsPage";
import "./Main.scss"
import "./Overrides.scss"
import { Changelog } from './components/Changelog';
import SimpleDialog from "./components/general/dialogs/SimpleDialog";
import { translate } from "./localization/AutoIntlProvider";
import TopNavigation from "./components/navigation/TopNavigation";
import SideMenuNavigation from "./components/navigation/SideMenuNavigation";
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import FilesPage from "./components/pages/FilesPage";
import DevToolPage from './components/pages/DevToolPage';
import SearchComponent from "./components/navigation/SearchComponent";
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
    dashboards: Dashboard[]
    developerToolVisible: boolean
}
type PathLoaderProps = {

} & RouteComponentProps<any>
type PathLoaderState = { loading: boolean, key:string }
const PathLoader = (Component: any, extractKey: (path: string) => string, forceUpdate?: (path: string) => string) =>
    class WithLoading extends React.Component<PathLoaderProps, PathLoaderState> {
        constructor(props: PathLoaderProps) {
            super(props)
            this.state = {
                loading: true,
                key:null
            }
        }
        shouldComponentUpdate = (nextProps: PathLoaderProps, nextState: PathLoaderState) => {
            const newKey = extractKey(nextProps.location.pathname)
            const ret = newKey != this.state.key ||
                nextState.loading != this.state.loading ||
                ((!!forceUpdate && forceUpdate(nextProps.location.pathname) != forceUpdate(this.props.location.pathname)) || false)
            return ret
        }
        static getDerivedStateFromProps = (props: PathLoaderProps, state: PathLoaderState): Partial<PathLoaderState> => {
            const newKey = extractKey(props.location.pathname)
            const setLoading = newKey != state.key
            if(setLoading)
            {
                return {key:newKey, loading:true}
            }
            return null
        }
        componentDidMount = () => {
            this.update()
        }
        componentDidUpdate = () => {
            this.update()
        }
        update = () => {
            const { location, history } = this.props
            ContextManager.resolveContextObjects(location.pathname, (resolvedData) => {
                if (resolvedData.success && resolvedData.resolvedPath && resolvedData.resolvedPath != location.pathname) {
                    history.replace(resolvedData.resolvedPath)
                }
                CommunityManager.applyCommunityTheme((resolvedData && resolvedData.community) || CommunityManager.getActiveCommunity())
                this.setState({ loading: false })
            })
        }
        renderLoading = () => {
            return <div key="loading" className="page">
                        <LoadingSpinner />
                    </div>
        }
        render() {
            const { loading } = this.state
            const updateKey = forceUpdate && forceUpdate(this.props.location.pathname)
            const key = extractKey(location.pathname)
            //console.log("HOC update", key, updateKey)
            return loading ? this.renderLoading() : <Component key={key} {...this.props} updateKey={updateKey} />
        }
    }
const PathLoadedProfilePage = PathLoader(ProfilePage, (path) => { return path })
const PathLoadedCommunityPage = PathLoader(CommunityPage, (path) => { return path })
const PathLoadedGroupPage = PathLoader(GroupPage, (path) => { return path })
const PathLoadedProjectPage = PathLoader(ProjectPage, (path) => { return path })
const PathLoadedEventPage = PathLoader(EventPage, (path) => { return path })
const PathLoadedTaskPage = PathLoader(TaskPage, (path) => { return path })
const PathLoadedConversationsPage = PathLoader(ConversationsPage, (path) => { return "/conversations/" }, (path) => path)
const PathLoadedDashboardPage = PathLoader(DashboardPage, (path) => { return path })
const ModalChangelog = WithModal(Changelog, "Changelog")
const ModalSearchComponent = WithSearch()


type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class Main extends React.Component<Props, State> {
    previousLocation: any
    constructor(props: Props) {
        super(props)
        this.state = {
            dashboards: [],
            developerToolVisible: false
        }
    }
    componentWillReceiveProps(nextProps) {
        this.previousLocation = this.props.location;
    }
    componentWillMount() {
        window.routerHistory = this.props.history;
    }
    render() {
        const { profile, location } = this.props
        const userIsAdmin = isAdmin(profile)
        const modal = location.state && location.state.modal
        return (
            <div id="main">
                <div id="main-content">
                    <ToastContainer />
                    <div id="content-block" className="">

                        {!this.props.loaded &&
                            <Switch>
                                <Route path={Routes.ANY} component={ApplicationLoader} />
                            </Switch>
                        }
                        {this.props.loaded &&
                            <DndProvider backend={HTML5Backend}>
                                <TopNavigation />
                                <SideMenuNavigation />
                                <Switch location={modal ? this.previousLocation : location}>
                                    {userIsAdmin &&
                                        <Route path={Routes.ADMIN_DASHBOARD_BUILDER.path} component={DashboardBuilderPage} />
                                    }
                                    <Redirect from={Routes.ELECTRON} to={Routes.ROOT} />
                                    <Route path={Routes.DEVELOPER_TOOL.path} component={DevToolPage} />
                                    <Route path={Routes.statusUrl(":statusid")} component={StatusPage} />
                                    <Route path={Routes.taskUrl(":communityname", ":projectname", ":taskid")} component={PathLoadedTaskPage} />
                                    <Route path={Routes.eventUrl(":communityname", ":eventname")} component={PathLoadedEventPage} exact={true} />
                                    <Route path={Routes.projectUrl(":communityname", ":projectname")} component={PathLoadedProjectPage} exact={true} />
                                    <Route path={Routes.groupUrl(":communityname", ":groupname")} component={PathLoadedGroupPage} exact={true}  />
                                    <PrivateRoute path={Routes.profileUrl(":profilename")} component={PathLoadedProfilePage} />
                                    <Route path={Routes.communityUrl(":communityname")} component={PathLoadedCommunityPage} exact={true} />
                                    <Route path={Routes.newsfeedUrl(":contextNaturalKey?", ":contextObjectId?")} component={NewsfeedPage} />
                                    <Route path={Routes.SIGNIN} component={Signin} />
                                    <Route path={Routes.SIGNOUT} component={Signout} />
                                    <Route path={Routes.ROOT} exact={true} component={PathLoadedDashboardPage} />
                                    <Route path={Routes.conversationUrl(":conversationId?")} exact={true} component={PathLoadedConversationsPage} />
                                    <Route path={Routes.FILES} exact={true} component={FilesPage} />
                                    <Route path={Routes.ELECTRON} component={PathLoadedDashboardPage} />
                                    <Route path={Routes.ANY} component={Error404} />
                                </Switch>
                                <Switch location={location}>
                                    <Route path={Routes.CHANGELOG} component={ModalChangelog} />
                                    <PrivateRoute path={Routes.SEARCH} component={ModalSearchComponent} />
                                </Switch>
                            </DndProvider>
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