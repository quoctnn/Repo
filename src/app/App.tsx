
//css
import "react-toastify/dist/ReactToastify.css"
import "bootstrap/dist/css/bootstrap.css";
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "@fortawesome/fontawesome-free/css/regular.min.css";
//js
import "jquery/dist/jquery.min.js"
import "popper.js/dist/umd/popper.min.js"
import "bootstrap/dist/js/bootstrap.min.js"
//other
import * as React from "react";
import * as ReactDOM from "react-dom";
import Main from "./Main";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { Settings } from "./utilities/Settings";
import { createStore, applyMiddleware } from "redux";
import appReducer from "./redux/index";
import { middleWares } from "./redux/middleware";
import initializeManagers from "./managers";
import ChannelEventStream from "./network/ChannelEventStream";
import AutoIntlProvider from "./localization/AutoIntlProvider";
import { BrowserRouter as Router} from "react-router-dom";
import "./utilities/Extensions"
import { AuthenticationManager } from "./managers/AuthenticationManager";
import { activateCrosstabAuthenticationSync } from "./redux/crosstabAuthenticationSync";
import { ThemeManager } from "./managers/ThemeManager";

const store = createStore(appReducer, applyMiddleware(...middleWares));
activateCrosstabAuthenticationSync()

window.store = store;
//initialize managers
initializeManagers();

export default store;

const persistor = persistStore(store, {}, () => {
    //rehydrate complete
    if (Settings.supportsTheming) {
        let themeIndex = store.getState().theme.theme || 0;
        ThemeManager.setTheme(themeIndex)
    }
    console.log("rehydrate complete")
    AuthenticationManager.signInCurrent()
})
export const App = (props: any) => {
    return (
    <Provider store={store}>
        <>
            <ChannelEventStream />
                <PersistGate loading={null} persistor={persistor}>
                    <AutoIntlProvider>
                            <Router>
                                <Main />
                            </Router>
                    </AutoIntlProvider>
                </PersistGate>
        </>
    </Provider>
  );
};
ReactDOM.render(<App />, document.getElementById("app-root"));

const detectFeatures = () => {
  if(Settings.isTouchDevice)
      document.body.classList.add("touch")
}
detectFeatures()