import {  Store } from 'redux';
import { RootState } from '../reducers';
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
        let state = StoreManager.getStore().getState().debug
        return state.availableApiEndpoints[state.apiEndpoint].endpoint + url
    }
    private static getStore = ():Store<RootState,any> => 
    {
        return window.store 
    }
}