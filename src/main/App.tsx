import 'bootstrap/dist/css/bootstrap.css';
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@fortawesome/fontawesome-free/css/solid.min.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore,applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { persistStore , createTransform } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import Main from "./Main";
import AutoIntlProvider from "../components/intl/AutoIntlProvider";
import { Types } from '../utilities/Types';
import { availableThemes } from '../reducers/settings';
import { Settings } from '../utilities/Settings';
import appReducer from '../reducers/index';
import { RootReducer } from '../reducers/index';
import { UserProfile } from '../reducers/profileStore';
require('jquery/dist/jquery');
require('popper.js/dist/umd/popper');
require('bootstrap/dist/js/bootstrap');
require("../utilities/Extensions")



const logger = store => next => action => {
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
const themeSwitcher = store => next => action => {
    let result = next(action)
    if (action.type === Types.SET_THEME) 
    {
        let state = store.getState() as RootReducer
        applyTheme(state.settings.theme)
    }
    return result
}
var middleWares = [logger]
if(Settings.supportsTheming)
{
    middleWares.push(themeSwitcher)
}
const store = createStore(appReducer, applyMiddleware(...middleWares))

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
})
ReactDOM.render(
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <AutoIntlProvider>
                    <Main/>
                </AutoIntlProvider>
            </PersistGate>
        </Provider>,
    document.getElementById("app-root")
);
export default store


function onUpdateReady() {  
    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) 
    { 
        if (confirm('A new version of intraWork is available. Do you want to update now?')) 
        {
            window.location.reload() 
        }
    } 
}
window.applicationCache.addEventListener("updateready", onUpdateReady);
if(window.applicationCache.status === window.applicationCache.UPDATEREADY) {
    onUpdateReady();
}
