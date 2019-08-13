import { Settings } from '../utilities/Settings';
export enum EndpointActionTypes {
    SetEndpoint = 'endpoint.set_endpoint',
    ResetEndpoint = 'endpoint.reset_endpoint',
}
export enum EndpointLoginType {
    API = 1,
    NATIVE
}
export interface ApiEndpoint {
    endpoint: string;
    loginType: EndpointLoginType;
    defaultCommunity: number;
    websocket: string;
}
export const availableEndpoints: ApiEndpoint[] = [
    {
        endpoint: 'https://intra.work',
        loginType: EndpointLoginType.API,
        defaultCommunity: 127,
        websocket: 'wss://intra.work/socket/'
    }
]
export const allowedUsers: string[] = [
    "godoppl@gmail.com",
    "kimandre@intrahouse.com",
    "andre",
    "leslie@intrahouse.com",
    "divya@intrahouse.com",
    "karen@intrahouse.com",
    "torben@intrahouse.com",
    "irina@intrahouse.com",
    "leon.he@outlook.com",
    "lourdes@intrahouse.com",
    "fernando@intrahouse.com",
    "helen@intrahouse.com"
]
const defaultEndpoint = 0
export interface SetEndpointAction{
    type:string
    endpoint:number
}
export const setEndpointAction = (index: number):SetEndpointAction => ({
    type: EndpointActionTypes.SetEndpoint,
    endpoint: index
})
export const resetEndpointAction = ():SetEndpointAction => ({
    type: EndpointActionTypes.SetEndpoint,
    endpoint: defaultEndpoint
})
const INITIAL_STATE = {
    endpoint: defaultEndpoint
}
const endpoint = (state = INITIAL_STATE, action:SetEndpointAction) => {
    switch (action.type) {
        case EndpointActionTypes.SetEndpoint:
            return { ...state, endpoint: action.endpoint }
        default:
            return state;
    }
}
export default endpoint
