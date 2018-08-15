import { Routes } from '../utilities/Routes';
import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NewsFeed from "../views/newsfeed/NewsFeed";
import TopNavigation from '../components/navigation/TopNavigation';
import { Community } from "../views/community/Community";
import { Group } from '../views/group/Group';
import { error404 } from '../views/error/error404';
import Signin from "../views/signin/Signin";
import { ToastContainer } from 'react-toastify';
import ProfileUpdate from "../views/profile/ProfileUpdate";
import { connect } from 'react-redux'
import { CollapsiblePanel, ArrowDirectionCollapsed } from '../components/general/CollapsiblePanel';
import DevTool from '../components/dev/DevTool';
import { Settings } from '../utilities/Settings';
import { List } from '../components/general/List';
import { UserProfile, avatarStateColorForUserProfile } from '../reducers/contacts';
import { Avatar } from '../components/general/Avatar';
import LeftNavigation from '../components/navigation/LeftNavigation';
import ChannelEventStream from "../components/general/ChannelEventStream";
require("react-toastify/dist/ReactToastify.css");
require("./Main.scss");

export interface Props {
  signedIn:boolean,
  contacts:UserProfile[]
}
class Main extends React.Component<Props, {}> {
  render() {
    return (
          <Router ref="router">
            <div id="main-content">
                <ToastContainer />
                  <ChannelEventStream />
                    <div id="content-block">
                        <div className="container">
                            <div>
                              <Switch>
                                {!Settings.isProduction && <Route path={Routes.DEVELOPER_TOOL} component={DevTool} /> }
                                <Route path={Routes.SIGNIN} component={Signin} />
                                <Route path={Routes.PROFILE_UPDATE} component={ProfileUpdate} />
                                <Route path="/community/:communityname/:groupname" component={Group} />
                                <Route path="/community/:communityname" component={Community} />
                                <Route path={Routes.ROOT} exact={true} component={NewsFeed} />
                                <Route path={Routes.ANY} component={error404} />
                              </Switch>
                            </div>
                        </div>
                    </div>
                    <div id="navigation-content" className="navigation">
                        <LeftNavigation />
                        <TopNavigation />
                        {this.props.signedIn && 
                        <CollapsiblePanel id="right-navigation" arrowDirectionCollapsed={ArrowDirectionCollapsed.LEFT}>
                            <List>{this.props.contacts.map((contact, index) => {
                                return (<li key={index}><Avatar image={contact.avatar} borderColor="green" borderWidth={2} stateColor={avatarStateColorForUserProfile(contact)} /></li>)
                            } )}</List>
                        </CollapsiblePanel>
                        }
                    </div>
            </div>
          </Router>
    );
  }
}
const mapStateToProps = (state) => {
  return {
      signedIn:state.auth.signedIn,
      contacts:state.contacts.contactsArray
  };
}
export default connect(mapStateToProps, null)(Main);