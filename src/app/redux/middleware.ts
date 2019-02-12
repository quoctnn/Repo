import { themeSwitcherMiddleware } from "./theme";
import { Settings } from "../../utilities/Settings";

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
export const middleWares = _middleWares