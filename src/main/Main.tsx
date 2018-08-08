import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { NewsFeed } from "../views/newsfeed/NewsFeed";
import { LeftNavigation } from '../components/navigation/LeftNavigation';
import { TopNavigation } from '../components/navigation/TopNavigation';
import { Community } from "../views/community/Community";
import { Group } from '../views/group/Group';
import { error404 } from '../views/error/error404';
import {Settings} from "../utilities/Settings"

let { DevTool } = Settings.dev_mode ? require('../components/dev/DevTool') : "";

require("./Main.scss");

export interface Props {
}
export class Main extends React.Component<Props, {}> {
  render() {

    return (
        <div id="main-content">
          <div className="content-block">
            <div className="container">
              <Router ref="router">
                <div>
                  <Switch>
                    <Route path="/:communityname/:groupname" component={Group} />
                    <Route path="/:communityname" component={Community} />
                    <Route path="/" exact={true} component={NewsFeed} />
                    <Route path="*" component={error404} />
                  </Switch>
                </div>
              </Router>
            </div>
          </div>
            <div id="navigation-content" className="navigation">
                <LeftNavigation />
                <TopNavigation />
            </div>
            {Settings.dev_mode && <DevTool />}
        </div>
    );
  }
}
