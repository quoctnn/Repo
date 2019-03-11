import { themeSwitcherMiddleware } from "./theme";
import { Settings } from "../utilities/Settings";
import { embedlyMiddleware } from "../components/general/embedly/redux";

const loggingMiddleware = store => next => action => {
    console.log('DISPATCHING => ', action);
    let result = next(action);
    console.log('NEXT STATE => ', store.getState());
    return result;
}

let _middleWares = [loggingMiddleware];
if (Settings.supportsTheming) {
    _middleWares.push(themeSwitcherMiddleware);
}
if (Settings.showEmbedlyCards) {
    _middleWares.push(embedlyMiddleware);
}
export const middleWares = _middleWares