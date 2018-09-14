import UpdateWatcher from '../components/general/UpdateWatcher';
import Profile from '../views/profile/Profile';
import { Routes } from '../utilities/Routes';
import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NewsFeed from "../views/newsfeed/NewsFeed";
import TopNavigation from '../components/navigation/TopNavigation';
import { Community } from "../views/community/Community";
import GroupView from '../views/group/Group';
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

export interface Props {
  signedIn:boolean,
}
interface State {
}
class Main extends React.Component<Props, {}> {
  state:State
  constructor(props) {
    super(props);
  }
  render() { 
    return (
          <Router ref="router">
            <div id="main-content">
                <UpdateWatcher />
                <ToastContainer />
                    <div id="content-block" className="transition">
                        <div className="container">
                            <div className="row">
                              <Switch>
                                {!Settings.isProduction && <Route path={Routes.DEVELOPER_TOOL} component={DevTool} /> }
                                create/
                                <Route path={Routes.SIGNIN} component={Signin} />
                                <Route path={Routes.PROFILES + ":slug"} component={Profile} />
                                <Route path={Routes.PROFILE_UPDATE} component={ProfileUpdate} />
                                {/* CONVERSATIONS */}
                                <Route path={Routes.CONVERSATION_CREATE} component={CreateConversation} />
                                <Route path={Routes.CONVERSATIONS} component={Conversations} />
                                <Route path={Routes.CONVERSATION + ":conversationid"} component={ConversationView} />

                                <Route path={Routes.COMMUNITY + ":communityid/:groupname"} component={GroupView} />
                                <Route path={Routes.COMMUNITY + ":communityname"} component={Community} />
                                <Route path={Routes.ROOT} exact={true} component={NewsFeed} />
                                <Route path={Routes.UPDATE_TOOL} exact={true} component={UpdateTool} />
                                <Route path={Routes.ANY} component={error404} />
                              </Switch>
                            </div>
                        </div>
                    </div>
                    <div id="navigation-content" className="navigation">
                        <TopNavigation />
                        <LeftNavigation />
                        {this.props.signedIn && <RightNavigation /> }
                    </div>
            </div>
          </Router>
    );
  }
}
const mapStateToProps = (state:RootState) => {
  return {
      signedIn:state.auth.signedIn,
  };
}
export default connect(mapStateToProps, null)(Main);