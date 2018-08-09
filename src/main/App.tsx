
import 'bootstrap/dist/css/bootstrap.css';
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
import { Types } from '../utilities/Types';
import { AjaxRequest } from '../network/AjaxRequest';

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
const updateAutorization = () =>
{
    let dState = store.getState().debug
    AjaxRequest.setup(dState.availableApiEndpoints[dState.apiEndpoint], dState.accessToken)
}
const accessTokenMiddleware = store => next => action => {
    let result = next(action)
    if(action.type == Types.SET_ACCESS_TOKEN_OVERRIDE || action.type == Types.SET_AUTORIZATION_DATA || action.type == Types.SET_API_ENDPOINT)
    {
        updateAutorization()
    }
    return result
}
const store = createStore(persistedReducer, applyMiddleware(logger, accessTokenMiddleware))
const persistor = persistStore(store, {}, () => 
{ 
    //rehydrate complete
    updateAutorization()
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

