"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("../utilities/Types");
const INITIAL_STATE = { backendApi: "http://test" };
const debug = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case Types_1.Types.SET_BACKEND_ENDPOINT:
            return Object.assign({}, state, { endpoint: action.endpoint });
        default:
            return state;
    }
};
exports.default = debug;
//# sourceMappingURL=debug.js.map