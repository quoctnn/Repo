import * as React from "react";
import * as ReactDOM from "react-dom";
import appReducers from '../reducers'
import {IntlProvider} from "react-intl";
import { createStore,applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { persistStore, persistReducer } from 'redux-persist'
import storageSession from 'redux-persist/lib/storage/session'
import { PersistGate } from 'redux-persist/integration/react'
import Intl from '../utilities/Intl';
import messages from "../intl/messages";
import { Main } from "./Main";

const persistConfig = {
    key: 'root',
    storage:storageSession,
}
const persistedReducer = persistReducer(persistConfig, appReducers)
const logger = store => next => action => {
    let result = next(action)
    return result
}
const store = createStore(persistedReducer, applyMiddleware(logger))
const persistor = persistStore(store)
let LOCALE = "en"

ReactDOM.render(
    <IntlProvider locale={LOCALE} messages={messages[LOCALE]}>
        <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <Main/>
                </PersistGate>
            </Provider>
    </IntlProvider>,
    document.getElementById("app-root")
);