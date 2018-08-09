"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const Actions = require("../../actions/Actions");
require("./DevTool.scss");
class DevTool extends React.Component {
    renderLanguageSelector() {
        return (React.createElement("div", { className: "dropdown" },
            React.createElement("button", { className: "btn btn-secondary dropdown-toggle", type: "button", id: "dropdownMenuButton", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false" }, this.props.language),
            React.createElement("div", { className: "dropdown-menu", "aria-labelledby": "dropdownMenuButton" }, this.props.availableLanguages.map((lang, index) => {
                return React.createElement("a", { key: index, onClick: () => { this.props.setLanguage(lang); }, className: "dropdown-item", href: "#" }, lang);
            }))));
    }
    render() {
        return (React.createElement("div", { id: "dev-tool" },
            React.createElement("button", { type: "button", className: "btn btn-primary", "data-toggle": "modal", "data-target": "#exampleModal" },
                React.createElement("i", { className: "fas fa-cog" })),
            React.createElement("div", { className: "modal fade", id: "exampleModal", role: "dialog", "aria-labelledby": "exampleModalLabel", "aria-hidden": "true" },
                React.createElement("div", { className: "modal-dialog", role: "document" },
                    React.createElement("div", { className: "modal-content" },
                        React.createElement("div", { className: "modal-header" },
                            React.createElement("h5", { className: "modal-title", id: "exampleModalLabel" }, "Dev Tool"),
                            React.createElement("button", { type: "button", className: "close", "data-dismiss": "modal", "aria-label": "Close" },
                                React.createElement("span", { "aria-hidden": "true" }, "\u00D7"))),
                        React.createElement("div", { className: "modal-body" },
                            React.createElement("table", { id: "table", className: "table table-hover" },
                                React.createElement("thead", null,
                                    React.createElement("tr", null,
                                        React.createElement("th", { "data-field": "key", className: "key" }, "Key"),
                                        React.createElement("th", { "data-field": "value" }, "Value"))),
                                React.createElement("tbody", null,
                                    React.createElement("tr", null,
                                        React.createElement("td", { "data-field": "key", className: "key" }, "Language"),
                                        React.createElement("td", { "data-field": "value" }, this.renderLanguageSelector()))))),
                        React.createElement("div", { className: "modal-footer" }))))));
    }
}
const mapStateToProps = (state) => {
    return {
        language: state.settings.language,
        availableLanguages: state.settings.availableLanguages
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        setLanguage: (language) => {
            dispatch(Actions.setLanguage(language));
        },
    };
};
exports.default = react_redux_1.connect(mapStateToProps, mapDispatchToProps)(DevTool);
//# sourceMappingURL=DevTool.js.map