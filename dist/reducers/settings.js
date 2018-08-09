"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("../utilities/Types");
const availableLanguages = ["en", "es", "no"];
const INITIAL_STATE = { language: "en", availableLanguages: availableLanguages };
const settings = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case Types_1.Types.SET_LANGUAGE:
            return Object.assign({}, state, { language: action.language });
        default:
            return state;
    }
};
exports.default = settings;
//# sourceMappingURL=settings.js.map