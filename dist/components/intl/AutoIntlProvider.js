"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_intl_1 = require("react-intl");
const messages_1 = require("../../intl/messages");
const react_redux_1 = require("react-redux");
const en = require("react-intl/locale-data/en");
const es = require("react-intl/locale-data/es");
const no = require("react-intl/locale-data/no");
react_intl_1.addLocaleData([...en, ...es, ...no]);
class AutoIntlProvider extends React.Component {
    render() {
        return (React.createElement(react_intl_1.IntlProvider, { locale: this.props.language, messages: messages_1.default[this.props.language] }, this.props.children));
    }
}
const mapStateToProps = (state) => {
    return {
        language: state.settings.language
    };
};
exports.default = react_redux_1.connect(mapStateToProps, null)(AutoIntlProvider);
//# sourceMappingURL=AutoIntlProvider.js.map