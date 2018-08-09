"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_intl_1 = require("react-intl");
const Intl_1 = require("../../utilities/Intl");
class NewsFeed extends React.Component {
    render() {
        return (React.createElement("div", { id: "news-feed" }, Intl_1.default.translate(this.props.intl, "search.placeholder")));
    }
}
exports.default = react_intl_1.injectIntl(NewsFeed);
//# sourceMappingURL=NewsFeed.js.map