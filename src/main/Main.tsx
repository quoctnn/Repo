import UpdateWatcher from '../components/general/UpdateWatcher';
import Profile from '../views/profile/ProfileView';
import Routes from '../utilities/Routes';
import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NewsFeed from "../views/newsfeed/NewsFeed";
import TopNavigation from '../components/navigation/TopNavigation';
import CommunityView from "../views/community/CommunityView";
import GroupView from '../views/group/GroupView';
import EventView from '../views/event/EventView';
import ProjectView from '../views/project/ProjectView';
import TaskView from '../views/task/TaskView';
import { error404 } from '../views/error/error404';
import Signin from "../views/signin/Signin";
import { ToastContainer } from 'react-toastify';
import ProfileUpdate from "../views/profile/ProfileUpdate";
import { connect } from 'react-redux'
import DevTool from '../components/dev/DevTool';
import { Settings } from '../utilities/Settings';
import LeftNavigation from '../components/navigation/LeftNavigation';
import RightNavigation from '../components/navigation/RightNavigation';
import { RootState } from '../reducers/index';
import Conversations from '../views/chat/Conversations';
import ConversationView from '../views/chat/ConversationView';
import UpdateTool from '../components/update/UpdateTool';
import CreateConversation from '../views/chat/CreateConversation';
require("react-toastify/dist/ReactToastify.css");
require("./Main.scss");

interface State {
}
export interface OwnProps
{
}
interface ReduxStateProps
{
  signedIn:boolean
  userList:boolean
}
interface ReduxDispatchProps
{
}
interface State
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class Main extends React.Component<Props, State> {
  constructor(props) {
    super(props);
  }
  render() {
    console.log("routes", Routes.eventUrl(":communityid",":eventname"))
    return (
          <Router ref="router">
            <div id="main-content">
              <UpdateWatcher />
                <ToastContainer />
                    <div id="content-block" className="transition">
                        <div className="container">
                            <div className="row">
                            {!this.props.signedIn &&
                              <Switch>
                                {!Settings.isProduction && <Route path={Routes.DEVELOPER_TOOL} component={DevTool} /> }
                                <Route path={Routes.SIGNIN} component={Signin} />
                                </Switch>
                            }
                            {this.props.signedIn &&
                              <Switch>
                                {!Settings.isProduction && <Route path={Routes.DEVELOPER_TOOL} component={DevTool} /> }
                                <Route path={Routes.SIGNIN} component={Signin} />
                                <Route path={Routes.profileUrl(":slug")} component={Profile} />
                                <Route path={Routes.PROFILE_UPDATE} component={ProfileUpdate} />
                                {/* CONVERSATIONS */}
                                <Route path={Routes.CONVERSATION_CREATE} component={CreateConversation} />
                                <Route path={Routes.CONVERSATIONS} component={Conversations} />
                                <Route path={Routes.conversationUrl(":conversationid")} component={ConversationView} />

                                <Route path={Routes.groupUrl(":communityid", ":groupname")} component={GroupView} />
                                <Route path={Routes.eventUrl(":communityid",":eventname")} component={EventView} />
                                <Route path={Routes.taskUrl(":communityid", ":projectname", ":taskid")} component={TaskView} />
                                <Route path={Routes.projectUrl(":communityid", ":projectname")} component={ProjectView} />
                                <Route path={Routes.communityUrl(":communityname")} component={CommunityView} />
                                <Route path={Routes.ROOT} exact={true} component={NewsFeed} />
                                <Route path={Routes.UPDATE_TOOL} exact={true} component={UpdateTool} />
                                <Route path={Routes.ANY} component={error404} />
                              </Switch>
                            }
                            </div>
                        </div>
                    </div>
                    <div id="navigation-content" className="navigation">
                        {this.props.signedIn && <LeftNavigation /> }
                        {this.props.signedIn && this.props.userList && <RightNavigation /> }
                        <TopNavigation />
                    </div>
            </div>
          </Router>
    );
  }
}
const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {
  return {
    signedIn:state.auth.signedIn,
    userList:false,
  }
}
export default connect<ReduxStateProps, void, OwnProps>(mapStateToProps, null)(Main)