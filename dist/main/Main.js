"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_router_dom_1 = require("react-router-dom");
const NewsFeed_1 = require("../views/newsfeed/NewsFeed");
const LeftNavigation_1 = require("../components/navigation/LeftNavigation");
const TopNavigation_1 = require("../components/navigation/TopNavigation");
const Community_1 = require("../views/community/Community");
const Group_1 = require("../views/group/Group");
const error404_1 = require("../views/error/error404");
const Settings_1 = require("../utilities/Settings");
const DevTool_1 = require("../components/dev/DevTool");
require("./Main.scss");
class Main extends React.Component {
    render() {
        return (React.createElement("div", { id: "main-content" },
            React.createElement("div", { className: "content-block" },
                React.createElement("div", { className: "container" },
                    React.createElement(react_router_dom_1.BrowserRouter, { ref: "router" },
                        React.createElement("div", null,
                            React.createElement(react_router_dom_1.Switch, null,
                                React.createElement(react_router_dom_1.Route, { path: "/:communityname/:groupname", component: Group_1.Group }),
                                React.createElement(react_router_dom_1.Route, { path: "/:communityname", component: Community_1.Community }),
                                React.createElement(react_router_dom_1.Route, { path: "/", exact: true, component: NewsFeed_1.default }),
                                React.createElement(react_router_dom_1.Route, { path: "*", component: error404_1.error404 })))))),
            React.createElement("div", { id: "navigation-content", className: "navigation" },
                React.createElement(LeftNavigation_1.LeftNavigation, null),
                React.createElement(TopNavigation_1.TopNavigation, null)),
            Settings_1.Settings.dev_mode && React.createElement(DevTool_1.default, null)));
    }
}
exports.Main = Main;
//# sourceMappingURL=Main.js.map