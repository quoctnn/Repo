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
        endpoint: 'http://alesund-dev.intra.work:8000',
        loginType: EndpointLoginType.NATIVE,
        defaultCommunity: 1,
        websocket: 'ws://alesund-dev.intra.work:8000/socket/'
    },
    {
        endpoint: 'http://192.168.15.28:8000',
        loginType: EndpointLoginType.NATIVE,
        defaultCommunity: 3,
        websocket: 'ws://192.168.15.28:8000/socket/'
    },
    {
        endpoint: 'https://dev.intra.work',
        loginType: EndpointLoginType.API,
        defaultCommunity: 27,
        websocket: 'wss://dev.intra.work/socket/'
    },
    {
        endpoint: 'http://127.0.0.1:8000/',
        loginType: EndpointLoginType.NATIVE,
        defaultCommunity: 3,
        websocket: 'ws://127.0.0.1:8000/socket/'
    },
    {
        endpoint: 'https://intra.work',
        loginType: EndpointLoginType.API,
        defaultCommunity: 132,
        websocket: 'wss://intra.work/socket/'
    }

]
const defaultEndpoint = Settings.isElectron ? 2 : 0
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
