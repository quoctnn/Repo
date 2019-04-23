import "intersection-observer"
import * as React from "react";
import { Route, Switch, withRouter, RouteComponentProps, Link, Redirect } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import Routes from "./utilities/Routes";
import { connect } from 'react-redux'
import "./Main.scss"
import { ReduxState } from "./redux";
import Signin from "./views/signin/Signin";
import { Error404 } from "./views/error/Error404";
import NewsfeedPage from "./components/pages/NewsfeedPage";
import { Dashboard, Community, UserProfile } from './types/intrasocial_types';
import ApplicationLoader from "./views/loading/ApplicationLoader";
import Signout from "./views/signout/Signout";
import CommunityPage from "./components/pages/CommunityPage";
import { CommunityManager } from "./managers/CommunityManager";
import DashboardPage from "./components/pages/DashboardPage";
import { ResolvedContext, setResolvedContextAction, resetResolvedContext } from "./redux/resolvedContext";
import { ProjectManager } from "./managers/ProjectManager";
import ProjectPage from "./components/pages/ProjectPage";
import { ToastManager } from "./managers/ToastManager";
import { translate } from "./localization/AutoIntlProvider";
import { TaskManager } from "./managers/TaskManager";
import TaskPage from "./components/pages/TaskPage";
import GroupPage from "./components/pages/GroupPage";
import { GroupManager } from "./managers/GroupManager";
import ProfilePage from "./components/pages/ProfilePage";
import { ProfileManager } from "./managers/ProfileManager";
import { PrivateRoute } from "./components/router/PrivateRoute";
import { nullOrUndefined, isAdmin } from "./utilities/Utilities";
import EventPage from "./components/pages/EventPage";
import { EventManager } from "./managers/EventManager";
import DashboardBuilderPage from "./components/pages/admin/DashboardBuilderPage";

type OwnProps = {
}
type ReduxStateProps = {
    signedIn:boolean
    loaded:boolean
    profile:UserProfile
}
type ReduxDispatchProps = {
    setResolvedContext:(context:ResolvedContext) => void
    resetResolvedContext:() => void
}
type State = {
    dashboards:Dashboard[]
    developerToolVisible:boolean
}
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
    componentDidMount = () => {
        this.resolveContextObjects()
    }
    componentDidUpdate = () => {
        this.resolveContextObjects()
    }
    resolveContextObjects = () => {

        if(this.props.loaded)
        {
            this.props.resetResolvedContext()
            const { location } = this.props
            const segments = location.pathname.split("/").filter(f => !nullOrUndefined(f) && f != "")
            console.log("resolveContextObjects for URL ", location.pathname)
            if(segments.length > 1)
            {
                const resolvedContext:ResolvedContext = {}
                if(segments[0] == "community")
                {
                    //community
                    let communityId = segments[1]
                    const community = CommunityManager.getCommunity(communityId)
                    if(community)
                    {
                        if(community)
                        {
                            this.setCommunityTheme(community)
                        }
                        resolvedContext.communityId = community.id
                    }
                    else
                        resolvedContext.communitySlug = communityId
                    //project
                    if(segments.length > 3 && segments[2] == "project")
                    {
                        let projectId = segments[3]
                        const project = ProjectManager.getProject(projectId)
                        if(project)
                        {
                            resolvedContext.projectId = project.id
                        }
                        else
                            resolvedContext.projectSlug = projectId
                    }
                    //group
                    else if(segments.length > 3 && segments[2] == "group")
                    {
                        let groupId = segments[3]
                        const group = GroupManager.getGroup(groupId)
                        if(group)
                        {
                            resolvedContext.groupId = group.id
                        }
                        else
                            resolvedContext.groupSlug = groupId
                    }
                    //event
                    else if(segments.length > 3 && segments[2] == "event")
                    {
                        let eventId = segments[3]
                        const event = EventManager.getEvent(eventId)
                        if(event)
                        {
                            resolvedContext.eventId = event.id
                        }
                        else
                            resolvedContext.eventSlug = eventId
                    }
                    //task
                    if(segments.length > 5 && segments[4] == "task")
                    {
                        let taskId = segments[5]
                        const task = TaskManager.getTask(taskId)
                        if(task)
                        {
                            resolvedContext.taskId = task.id
                        }
                        else
                            resolvedContext.taskSlug = taskId
                    }
                }
                else if(segments[0] == "profile")
                {
                    this.setCommunityTheme(null)
                    //profile
                    let profileId = segments[1]
                    const profile = ProfileManager.getProfile(profileId)
                    if(profile)
                    {
                        resolvedContext.profileId = profile.id
                    }
                    else
                        resolvedContext.profileSlug = profileId
                }
                //store
                this.props.setResolvedContext(resolvedContext)
                this.resolveObjects(resolvedContext)
            }
            else {
                this.setCommunityTheme(CommunityManager.getActiveCommunity())
            }
        }
    }
    resolveObjects = (resolvedContext:ResolvedContext) => {
        if(resolvedContext.communitySlug)
        {
            CommunityManager.ensureCommunityExists(resolvedContext.communitySlug, (community) => {
                if(!community)
                    ToastManager.showErrorToast(translate("context.resolve.community.error"))
                this.props.setResolvedContext({communityId:community && community.id, communityResolved:new Date().getTime()})
                this.setCommunityTheme(community)
            })
        }
        if(resolvedContext.projectSlug)
        {
            ProjectManager.ensureProjectExists(resolvedContext.projectSlug, (project) => {
                if(!project)
                    ToastManager.showErrorToast(translate("context.resolve.project.error"))
                this.props.setResolvedContext({projectId:project && project.id, projectResolved:new Date().getTime()})
            })
        }
        if(resolvedContext.taskSlug)
        {
            TaskManager.ensureTaskExists(resolvedContext.taskSlug, (task) => {
                if(!task)
                    ToastManager.showErrorToast(translate("context.resolve.task.error"))
                this.props.setResolvedContext({taskId:task && task.id, taskResolved:new Date().getTime()})
            })
        }
        if(resolvedContext.groupSlug)
        {
            GroupManager.ensureGroupExists(resolvedContext.groupSlug, (group) => {
                if(!group)
                    ToastManager.showErrorToast(translate("context.resolve.group.error"))
                this.props.setResolvedContext({groupId:group && group.id, groupResolved:new Date().getTime()})
            })
        }
        if(resolvedContext.profileSlug)
        {
            GroupManager.ensureGroupExists(resolvedContext.profileSlug, (profile) => {
                if(!profile)
                    ToastManager.showErrorToast(translate("context.resolve.profile.error"))
                this.props.setResolvedContext({profileId:profile && profile.id, profileResolved:new Date().getTime()})
            })
        }
        if(resolvedContext.eventSlug)
        {
            EventManager.ensureEventExists(resolvedContext.eventSlug, (event) => {
                if(!event)
                    ToastManager.showErrorToast(translate("context.resolve.event.error"))
                this.props.setResolvedContext({eventId:event && event.id, eventResolved:new Date().getTime()})
            })
        }
    }
    setCommunityTheme = (community:Community) => {
        CommunityManager.applyCommunityTheme(community)
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
                                    <Route path={Routes.taskUrl(":communityname", ":projectname", ":taskid")} component={TaskPage} />
                                    <Route path={Routes.eventUrl(":communityname", ":eventname")} component={EventPage} exact={true} />
                                    <Route path={Routes.projectUrl(":communityname", ":projectname")} component={ProjectPage} exact={true} />
                                    <Route path={Routes.groupUrl(":communityname", ":groupname")} component={GroupPage} exact={true} />
                                    <PrivateRoute path={Routes.profileUrl(":profilename")} component={ProfilePage} />
                                    <Route path={Routes.communityUrl(":communityname")} component={CommunityPage} exact={true} />
                                    <Route path={Routes.newsfeedUrl(":contextNaturalKey?", ":contextObjectId?")} component={NewsfeedPage} />
                                    <Route path={Routes.SIGNIN} component={Signin} />
                                    <Route path={Routes.SIGNOUT} component={Signout} />
                                    <Route path={Routes.ROOT} exact={true} component={DashboardPage} />
                                    <Route path={Routes.ELECTRON} component={DashboardPage} />
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
        setResolvedContext:(context:ResolvedContext) => {
          dispatch(setResolvedContextAction(context))
        },
        resetResolvedContext:() => {
            dispatch(resetResolvedContext())
        }
  }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(Main))