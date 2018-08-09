"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redux_1 = require("redux");
const debug_1 = require("./debug");
const settings_1 = require("./settings");
const appReducers = redux_1.combineReducers({
    debug: debug_1.default, settings: settings_1.default
});
exports.default = appReducers;
//# sourceMappingURL=index.js.map