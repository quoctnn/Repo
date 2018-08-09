import {Types} from "../utilities/Types"
export enum LoginType {
    API = 1,
    SESSION
}
export interface ApiEndpoint {
    endpoint: string,
    loginType: LoginType,
    token: string,
    cookie: string,
}
const availableApiEndpoints:ApiEndpoint[] = [
    {endpoint:"https://dev.intra.work",loginType:LoginType.API, token: null, cookie:null},
    {endpoint:"http://alesund-dev.intra.work:8000", loginType:LoginType.SESSION, token: null, cookie:null}
]


const INITIAL_STATE = { apiEndpoint: 0, availableApiEndpoints: availableApiEndpoints, accessToken:""}
const debug = (state = INITIAL_STATE, action) => {
    switch(action.type) 
    {
        case Types.SET_API_ENDPOINT:
            return { ...state, apiEndpoint: action.apiEndpoint}
        case Types.SET_ACCESS_TOKEN_OVERRIDE:
            return { ...state, accessToken: action.accessToken}
        case Types.SET_AUTORIZATION_DATA:
            var s = { ...state}
            s.availableApiEndpoints[s.apiEndpoint].token = action.token
            s.availableApiEndpoints[s.apiEndpoint].cookie = action.cookie
            return s
        default:
            return state;
    }
}
export default debug