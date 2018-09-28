import {  Store } from 'redux';
import { RootState } from '../../reducers';
import * as Actions from '../../actions/Actions';
import ApiClient from '../../network/ApiClient';
import { UserProfile } from '../../reducers/profileStore';
class ProfileManagerSingleton 
{
    constructor()
    {
        this.setup = this.setup.bind(this)
        this.ensureProfilesExists = this.ensureProfilesExists.bind(this)
    }
    setup()
    {
    }
    ensureProfilesExists(profiles:number[], completion:() => void)
    {
        let store = this.getStore()
        let state = store.getState()
        let ids = state.profileStore.allIds.map(id => id)
        ids.push(state.profile.id)
        let requestIds = profiles.filter(id => ids.indexOf(id) == -1)
        if(requestIds.length > 0)
        {
            ApiClient.getProfiles(requestIds, (data:{results:UserProfile[]}, status, error) => {
                if(data && data.results && data.results.length > 0)
                {
                    store.dispatch(Actions.storeProfiles(data.results))
                }
                else 
                {
                    console.log("error fetching profiles", error)
                }
                completion()
            })
        }
        else 
        {
            completion()
        }

    }
    getProfiles(profiles:number[]) 
    {
        let s = this.getStore().getState()
        let authUser = s.profile
        let userProfiles = profiles.map(p =>{
            if(authUser.id == p)
                return authUser
            return s.profileStore.byId[p]
        }).filter(u => u != null)
        return userProfiles
    }
    getAuthenticatedUser()
    {
        return this.getStore().getState().profile
    }
    getAuthorizationToken()
    {
        let d = this.getStore().getState().debug
        return d.accessToken || d.availableApiEndpoints[d.apiEndpoint].token
    }
    private getStore():Store<RootState,any>
    {
        return window.store 
    }
}
export let ProfileManager = new ProfileManagerSingleton();