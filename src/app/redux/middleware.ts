import { Settings } from "../utilities/Settings";
import { embedlyMiddleware } from "../components/general/embedly/redux";
//import { messageQueueMiddleware } from "./messageQueue";

const loggingMiddleware = store => next => action => {
    // console.log('DISPATCHING => ', action);
    let result = next(action);
    // console.log('NEXT STATE => ', store.getState());
    return result;
}

let _middleWares = [loggingMiddleware];
if (Settings.showEmbedlyCards) {
    _middleWares.push(embedlyMiddleware);
}
//_middleWares.push(messageQueueMiddleware)
export const middleWares = _middleWares