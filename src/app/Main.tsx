import "intersection-observer"
import * as React from "react";
import { Route, Switch, withRouter, RouteComponentProps, Redirect } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import Routes from "./utilities/Routes";
import { connect } from 'react-redux'
import "./Main.scss"
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
import { PrivateRoute } from "./components/router/PrivateRoute";
import { isAdmin } from "./utilities/Utilities";
import EventPage from "./components/pages/EventPage";
import DashboardBuilderPage from "./components/pages/admin/DashboardBuilderPage";
import { ContextManager } from "./managers/ContextManager";
import DevTool from "./components/dev/DevTool";
import LoadingSpinner from "./components/LoadingSpinner";
import { CommunityManager } from "./managers/CommunityManager";

type OwnProps = {
}
type ReduxStateProps = {
    signedIn:boolean
    loaded:boolean
    profile:UserProfile
}
type ReduxDispatchProps = {
}
type State = {
    dashboards:Dashboard[]
    developerToolVisible:boolean
}
type PathLoaderProps = {

} & RouteComponentProps<any>
type PathLoaderState = {loading:boolean}
const PathLoader = (Component: any, extractKey:(path:string) => string) =>
    class WithLoading extends React.Component<PathLoaderProps , PathLoaderState> {
      constructor(props:PathLoaderProps){
          super(props)
          this.state = {
              loading:true
          }
        }
        shouldComponentUpdate = (nextProps:PathLoaderProps, nextState:PathLoaderState) => {
            return extractKey(nextProps.location.pathname) != extractKey(this.props.location.pathname) || 
                    nextState.loading != this.state.loading
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
                if(resolvedData.success && resolvedData.resolvedPath && resolvedData.resolvedPath != location.pathname)
                {
                    history.replace(resolvedData.resolvedPath)
                }
                CommunityManager.applyCommunityTheme((resolvedData && resolvedData.community) || CommunityManager.getActiveCommunity())
                this.setState({loading:false})
            })
        }
        render() {
            const { loading } = this.state
            return loading ? <LoadingSpinner /> : <Component key={extractKey(location.pathname)} {...this.props} />
        }
    }
const PathLoadedProfilePage = PathLoader(ProfilePage, (path) => { return path})
const PathLoadedCommunityPage = PathLoader(CommunityPage, (path) => { return path})
const PathLoadedGroupPage = PathLoader(GroupPage, (path) => { return path})
const PathLoadedProjectPage = PathLoader(ProjectPage, (path) => { return path})
const PathLoadedEventPage = PathLoader(EventPage, (path) => { return path})
const PathLoadedTaskPage = PathLoader(TaskPage, (path) => { return path})
const PathLoadedDashboardPage = PathLoader(DashboardPage, (path) => { return path})

type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class Main extends React.Component<Props, State> {
    previousLocation:any
    constructor(props:Props)
    {
        super(props)
        this.state = {
            dashboards:[],
            developerToolVisible:false
        }
    }
    componentWillReceiveProps(nextProps) {
        this.previousLocation = this.props.location;
    }
    render() {
        const {profile} = this.props
        const userIsAdmin = isAdmin(profile)
        return(
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
                                <Switch>
                                    {userIsAdmin && 
                                        <Route path={Routes.ADMIN_DASHBOARD_BUILDER.path} component={DashboardBuilderPage} />
                                    }
                                    <Redirect from={Routes.ELECTRON} to={Routes.ROOT} />
                                    <Route path={Routes.DEVELOPER_TOOL.path} component={DevTool} />
                                    <Route path={Routes.taskUrl(":communityname", ":projectname", ":taskid")} component={PathLoadedTaskPage} />
                                    <Route path={Routes.eventUrl(":communityname", ":eventname")} component={PathLoadedEventPage} exact={true} />
                                    <Route path={Routes.projectUrl(":communityname", ":projectname")} component={PathLoadedProjectPage} exact={true} />
                                    <Route path={Routes.groupUrl(":communityname", ":groupname")} component={PathLoadedGroupPage} exact={true} />
                                    <PrivateRoute path={Routes.profileUrl(":profilename")} component={PathLoadedProfilePage} />
                                    <Route path={Routes.communityUrl(":communityname")} component={PathLoadedCommunityPage} exact={true} />
                                    <Route path={Routes.newsfeedUrl(":contextNaturalKey?", ":contextObjectId?")} component={NewsfeedPage} />
                                    <Route path={Routes.SIGNIN} component={Signin} />
                                    <Route path={Routes.SIGNOUT} component={Signout} />
                                    <Route path={Routes.ROOT} exact={true} component={PathLoadedDashboardPage} />
                                    <Route path={Routes.ELECTRON} component={PathLoadedDashboardPage} />
                                    <Route path={Routes.ANY} component={Error404} />
                                </Switch>
                            }
                        </div>
                    </div>
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
    return {
      signedIn:state.authentication.signedIn,
      loaded:state.application.loaded,
      profile:state.authentication.profile
    }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {
  }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(Main))