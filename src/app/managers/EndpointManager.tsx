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
        if (url.indexOf('://') > 0 || url.indexOf('//') === 0 ) 
        {
            return url
        }
        let state = EndpointManager.getStore().getState().endpoint
        return availableEndpoints[state.endpoint].endpoint + url
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