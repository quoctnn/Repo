import { Routes } from '../utilities/Routes';
import SigninController from '../components/general/SigninController';
import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NewsFeed from "../views/newsfeed/NewsFeed";
import { LeftNavigation } from '../components/navigation/LeftNavigation';
import TopNavigation from '../components/navigation/TopNavigation';
import { Community } from "../views/community/Community";
import { Group } from '../views/group/Group';
import { error404 } from '../views/error/error404';
import {Settings} from "../utilities/Settings"
import DevTool from "../components/dev/DevTool";
import Signin from "../views/signin/Signin";
import { ToastContainer } from 'react-toastify';
import ProfileUpdate from "../views/profile/ProfileUpdate";

require("react-toastify/dist/ReactToastify.css");
require("./Main.scss");
  
export interface Props {
}
export class Main extends React.Component<Props, {}> {
  render() {

    return (
          <Router ref="router">
            <div id="main-content">
                <ToastContainer />
                <div id="content-block">
                  <div className="container">
                      <div>
                        <Switch>
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
                </div>
              {!Settings.isProduction && <DevTool /> }
              <SigninController />
            </div>
          </Router>
    );
  }
}
