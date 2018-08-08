import {Types} from "../utilities/Types"
const INITIAL_STATE = { backendApi: "http://test" }
const debug = (state = INITIAL_STATE, action) => {
    switch(action.type) 
    {
        case Types.SET_BACKEND_ENDPOINT:
            return { ...state, endpoint: action.endpoint}
        default:
            return state;
    }
}
export default debug