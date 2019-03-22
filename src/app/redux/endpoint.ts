export enum EndpointActionTypes {
    SetEndpoint = 'endpoint.set_endpoint',
}
export enum EndpointLoginType {
    API = 1,
    NATIVE
}
export interface ApiEndpoint {
    endpoint: string;
    loginType: EndpointLoginType;
    websocket: string;
}
export const availableEndpoints: ApiEndpoint[] = [
    {
        endpoint: 'http://alesund-dev.intra.work:8000',
        loginType: EndpointLoginType.NATIVE,
        websocket: 'ws://alesund-dev.intra.work:8000/socket/'
    },
    {
        endpoint: 'http://192.168.15.28:8000',
        loginType: EndpointLoginType.NATIVE,
        websocket: 'ws://192.168.15.28:8000/socket/'
    },
    {
        endpoint: 'https://dev.intra.work',
        loginType: EndpointLoginType.NATIVE,
        websocket: 'wss://dev.intra.work/socket/'
    },
    {
        endpoint: 'http://127.0.0.1:8000/',
        loginType: EndpointLoginType.NATIVE,
        websocket: 'ws://127.0.0.1:8000/socket/'
    },
]
export interface SetEndpointAction{
    type:string
    endpoint:number
}
export const setEndpointAction = (index: number):SetEndpointAction => ({
    type: EndpointActionTypes.SetEndpoint,
    endpoint: index
})
const INITIAL_STATE = {
    endpoint: 0
}
const endpoint = (state = INITIAL_STATE, action:SetEndpointAction) => {
    switch (action.type) {
        case EndpointActionTypes.SetEndpoint:
            return { ...state, apiEndpoint: action.endpoint }
        default:
            return state;
    }
}
export default endpoint
