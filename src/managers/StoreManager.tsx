import {  Store } from 'redux';
import { ReduxState } from '../app/redux';
import { availableEndpoints } from '../app/redux/endpoint';
export abstract class StoreManager 
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
        let state = StoreManager.getStore().getState().endpoint
        return availableEndpoints[state.endpoint].endpoint + url
    }
    private static getStore = ():Store<ReduxState,any> => 
    {
        return window.store 
    }
}