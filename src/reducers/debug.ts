import {Types} from "../utilities/Types"
const availableApiEndpoints = ["http://alesund-dev.intra.work:8000"]
const INITIAL_STATE = { apiEndpoint: 0, availableApiEndpoints: availableApiEndpoints, accessToken:""}
const debug = (state = INITIAL_STATE, action) => {
    switch(action.type) 
    {
        case Types.SET_API_ENDPOINT:
            return { ...state, apiEndpoint: action.apiEndpoint}
        case Types.SET_ACCESS_TOKEN:
            return { ...state, accessToken: action.accessToken}
        default:
            return state;
    }
}
export default debug