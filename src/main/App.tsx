import 'bootstrap/dist/css/bootstrap.css';
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@fortawesome/fontawesome-free/css/solid.min.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as OfflinePluginRuntime from 'offline-plugin/runtime';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { persistStore, createTransform } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import Main from './Main';
import AutoIntlProvider from '../components/intl/AutoIntlProvider';
import { Types } from '../utilities/Types';
import { availableThemes } from '../reducers/settings';
import { Settings } from '../utilities/Settings';
import appReducer from '../reducers/index';
import { RootReducer } from '../reducers/index';
import { UserProfile } from '../reducers/profileStore';
import { PaginatorAction } from '../reducers/createPaginator';
import ApiClient from '../network/ApiClient';
import ChannelEventStream from "../components/general/ChannelEventStream";
import * as Actions from "../actions/Actions" 
require('jquery/dist/jquery');
require('popper.js/dist/umd/popper');
require('bootstrap/dist/js/bootstrap');
require('../utilities/Extensions');

OfflinePluginRuntime.install();


const loggingMiddleware = store => next => action => {
    console.log("DISPATCHING => ", action)
    let result = next(action)
    console.log('NEXT STATE => ', store.getState())
    return result
}
const applyTheme = (themeIndex:number) => {
    let theme = availableThemes[themeIndex]
    let selector = theme.selector
    let root = document.querySelector(":root")
    root.className = selector
}
const themeSwitcherMiddleware = store => next => action => {
    let result = next(action)
    if (action.type === Types.SET_THEME) 
    {
        let state = store.getState() as RootReducer
        applyTheme(state.settings.theme)
    }
    return result
}
const paginationMiddleware = store => next => action => {
    let result = next(action)
    if (action.type === Types.REQUEST_PAGE) 
    {
        let a = action as PaginatorAction
        ApiClient.getPage(a.meta.endpoint,a.payload.page , a.meta.pageSize, (data, status, error) => {

            let receivePageAction = (  page:number, results:any[], total:number):PaginatorAction => ({
                type:  Types.RECEIVE_PAGE,
                payload: {
                    page,
                    results,
                    total:total
                },
                meta: a.meta
            })
            store.dispatch(receivePageAction(a.payload.page, data.results || [], data.count || 0))
        })
    }
    return result
}
var middleWares = [loggingMiddleware, paginationMiddleware]
if(Settings.supportsTheming)
{
    middleWares.push(themeSwitcherMiddleware)
}
const store = createStore(appReducer, applyMiddleware(...middleWares));

export const getProfileById = (id:number):UserProfile => 
{
    let s = store.getState()
    if(s.profile.id == id)
        return s.profile
    return  s.profileStore.byId[id]
}
const persistor = persistStore(store, { }, () => 
{ 
    //rehydrate complete
    if(Settings.supportsTheming)
    {
        let themeIndex = store.getState().settings.theme || 0
        applyTheme(themeIndex)
    }
    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) 
    { 
        if (confirm('A new version of intraWork is available. Do you want to update now?')) 
        {
            //clear data 
            store.dispatch(Actions.resetPagedData())
            debugger  
            // window.location.reload() 
        }
    } 
})

ReactDOM.render(
        <Provider store={store}>
            <>
                <ChannelEventStream />
                <PersistGate loading={null} persistor={persistor}>
                    <AutoIntlProvider>
                        <Main/>
                    </AutoIntlProvider>
                </PersistGate>
            </>
        </Provider>,
    document.getElementById("app-root")
);
export default store 
