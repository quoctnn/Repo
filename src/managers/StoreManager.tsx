import {  Store } from 'redux';
import { RootState } from '../reducers';
class StoreManagerSingleton 
{
    constructor()
    {
        this.setup = this.setup.bind(this)
        this.getStore = this.getStore.bind(this)
        this.applyEndpointDomain = this.applyEndpointDomain.bind(this)
    }
    setup()
    {
    }
    applyEndpointDomain(url:string)
    {
        if (url.indexOf('://') > 0 || url.indexOf('//') === 0 ) 
        {
            return url
        }
        let state = this.getStore().getState().debug
        return state.availableApiEndpoints[state.apiEndpoint].endpoint + url
    }
    private getStore():Store<RootState,any>
    {
        return window.store 
    }
}
export let StoreManager = new StoreManagerSingleton();