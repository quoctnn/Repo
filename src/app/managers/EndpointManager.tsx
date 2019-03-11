import {  Store } from 'redux';
import { availableEndpoints } from '../redux/endpoint';
import { ReduxState } from '../redux';
export abstract class EndpointManager 
{
    static setup()
    {
    }
    static applyEndpointDomain = (url:string) => 
    {
        let state = EndpointManager.getStore().getState().endpoint
        const baseUrl = availableEndpoints[state.endpoint].endpoint
        const u = new URL(url, baseUrl)
        return u.href
    }
    static currentEndpoint = () => {
        let state = EndpointManager.getStore().getState().endpoint
        return availableEndpoints[state.endpoint]
    }
    private static getStore = ():Store<ReduxState,any> => 
    {
        return window.store 
    }
}