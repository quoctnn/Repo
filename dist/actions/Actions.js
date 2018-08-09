"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("../utilities/Types");
//debug
exports.setBackendEndpoint = (endpoint) => ({
    type: Types_1.Types.SET_BACKEND_ENDPOINT,
    endpoint: endpoint
});
//settings
exports.setLanguage = (language) => ({
    type: Types_1.Types.SET_LANGUAGE,
    language: language
});
//# sourceMappingURL=Actions.js.map