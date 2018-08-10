import {Types} from "../utilities/Types"
export enum LoginType {
    API = 1,
    NATIVE
}
export interface ApiEndpoint {
    endpoint: string,
    loginType: LoginType,
    token: string,
}
const availableApiEndpoints:ApiEndpoint[] = [
    {endpoint:"https://dev.intra.work",loginType:LoginType.API, token: null},
    {endpoint:"http://alesund-dev.intra.work:8000", loginType:LoginType.NATIVE, token: null}
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
            return s
        default:
            return state;
    }
}
export default debug