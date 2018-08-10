
import 'bootstrap/dist/css/bootstrap.css';
import "@fortawesome/fontawesome-free/css/fontawesome.min.css"
import "@fortawesome/fontawesome-free/css/solid.min.css"
import * as React from "react";
import * as ReactDOM from "react-dom";
import appReducers from '../reducers'
import { createStore,applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { persistStore, persistReducer } from 'redux-persist'
import storageSession from 'redux-persist/lib/storage/session'
import { PersistGate } from 'redux-persist/integration/react'
import { Main } from "./Main";
import AutoIntlProvider from "../components/intl/AutoIntlProvider";
require('jquery/dist/jquery');
require('popper.js/dist/umd/popper');
require('bootstrap/dist/js/bootstrap');

const persistConfig = {
    key: 'root',
    storage:storageSession,
}
const persistedReducer = persistReducer(persistConfig, appReducers)
const logger = store => next => action => {
    console.log("DISPATCHING => ", action)
    let result = next(action)
    console.log('NEXT STATE => ', store.getState())
    return result
}
const store = createStore(persistedReducer, applyMiddleware(logger))
const persistor = persistStore(store, {}, () => 
{ 
    //rehydrate complete
})
ReactDOM.render(
    <Provider store={store}>
        <AutoIntlProvider>
            <PersistGate loading={null} persistor={persistor}>
                <Main/>
            </PersistGate>
        </AutoIntlProvider>
    </Provider>,
    document.getElementById("app-root")
);
export default store

