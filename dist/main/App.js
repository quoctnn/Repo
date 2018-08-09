"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDOM = require("react-dom");
const reducers_1 = require("../reducers");
const redux_1 = require("redux");
const react_redux_1 = require("react-redux");
const redux_persist_1 = require("redux-persist");
const session_1 = require("redux-persist/lib/storage/session");
const react_1 = require("redux-persist/integration/react");
const Main_1 = require("./Main");
const AutoIntlProvider_1 = require("../components/intl/AutoIntlProvider");
const persistConfig = {
    key: 'root',
    storage: session_1.default,
};
const persistedReducer = redux_persist_1.persistReducer(persistConfig, reducers_1.default);
const logger = store => next => action => {
    console.log("DISPATCHING => ", action);
    let result = next(action);
    console.log('NEXT STATE => ', store.getState());
    return result;
};
const store = redux_1.createStore(persistedReducer, redux_1.applyMiddleware(logger));
const persistor = redux_persist_1.persistStore(store);
ReactDOM.render(React.createElement(react_redux_1.Provider, { store: store },
    React.createElement(AutoIntlProvider_1.default, null,
        React.createElement(react_1.PersistGate, { loading: null, persistor: persistor },
            React.createElement(Main_1.Main, null)))), document.getElementById("app-root"));
//# sourceMappingURL=App.js.map