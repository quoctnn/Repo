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
const PathLoader = (Component: any) =>
class WithLoading extends React.Component<PathLoaderProps , {loading:boolean}> {
      constructor(props:PathLoaderProps){
          super(props)
          this.state = {
              loading:true
          }
    }
    componentDidMount = () => {

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
      return loading ? <LoadingSpinner /> : <Component ref={location.pathname} {...this.props} />
    }
}
/*
const PathLoadedProfilePage = PathLoader(ProfilePage)
const PathLoadedCommunityPage = PathLoader(CommunityPage)
const PathLoadedGroupPage = PathLoader(GroupPage)
const PathLoadedProjectPage = PathLoader(ProjectPage)
const PathLoadedEventPage = PathLoader(EventPage)
const PathLoadedTaskPage = PathLoader(TaskPage)
const PathLoadedDashboardPage = PathLoader(DashboardPage)
*/

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
                                    <Route path={Routes.taskUrl(":communityname", ":projectname", ":taskid")} component={PathLoader(TaskPage)} />
                                    <Route path={Routes.eventUrl(":communityname", ":eventname")} component={PathLoader(EventPage)} exact={true} />
                                    <Route path={Routes.projectUrl(":communityname", ":projectname")} component={PathLoader(ProjectPage)} exact={true} />
                                    <Route path={Routes.groupUrl(":communityname", ":groupname")} component={PathLoader(GroupPage)} exact={true} />
                                    <PrivateRoute path={Routes.profileUrl(":profilename")} component={PathLoader(ProfilePage)} />
                                    <Route path={Routes.communityUrl(":communityname")} component={PathLoader(CommunityPage)} exact={true} />
                                    <Route path={Routes.newsfeedUrl(":contextNaturalKey?", ":contextObjectId?")} component={NewsfeedPage} />
                                    <Route path={Routes.SIGNIN} component={Signin} />
                                    <Route path={Routes.SIGNOUT} component={Signout} />
                                    <Route path={Routes.ROOT} exact={true} component={PathLoader(DashboardPage)} />
                                    <Route path={Routes.ELECTRON} component={PathLoader(DashboardPage)} />
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