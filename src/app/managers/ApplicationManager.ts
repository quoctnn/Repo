import {  Store } from 'redux';
import { ReduxState } from '../redux/index';
import { setApplicationLoadedAction } from '../redux/application';
import { AuthenticationManager } from './AuthenticationManager';
import { Dashboard } from '../types/intrasocial_types';
import ApiClient, { ListOrdering } from '../network/ApiClient';
import { ToastManager } from './ToastManager';
import { CommunityManager } from './CommunityManager';
import { ProfileManager } from './ProfileManager';
export type ApplicationData = {
    dashboards:Dashboard[]
    communitiesLoaded:boolean
    profileLoaded:boolean
    contactsLoaded:boolean
}
export abstract class ApplicationManager
{
    private static applicationData:ApplicationData = null
    static setup = () =>
    {
        ApplicationManager.resetData()
    }
    private static resetData = () => {
        
        ApplicationManager.applicationData = {dashboards:[], communitiesLoaded:false, profileLoaded:false, contactsLoaded:false}
    }
    static loadApplication = () => {
        console.log("loadApplication")
        ApplicationManager.resetData()
        const token = AuthenticationManager.getAuthenticationToken()
        if(!!token)
            ApplicationManager.fetchContacts()
        else
            ApplicationManager.applicationData.contactsLoaded = true
        ApplicationManager.fetchDashboards()
        ApplicationManager.fetchCommunities()
        ApplicationManager.fetchProfile()
    }
    private static fetchDashboards = () => {
        ApiClient.getDashboards((data, status, error) => {
            const dashboards = (data && data.results) || []
            ApplicationManager.applicationData.dashboards = dashboards
            ApplicationManager.checkIfLoaded()
            ToastManager.showErrorToast(error)
        })
    }
    private static fetchCommunities = () => {
        ApiClient.getCommunities(true, ListOrdering.ALPHABETICAL, 100, 0, (data, status, error) => {
            const communities = (data && data.results) || []
            CommunityManager.storeCommunities(communities)
            ApplicationManager.applicationData.communitiesLoaded = true
            ApplicationManager.checkIfLoaded()
            ToastManager.showErrorToast(error)
        })
    }
    private static fetchProfile = () => {
        ApiClient.getMyProfile((data, status, error) => {
            const profile = data
            AuthenticationManager.setAuthenticatedUser(profile)
            ApplicationManager.applicationData.profileLoaded = true 
            ApplicationManager.checkIfLoaded()
            ToastManager.showErrorToast(error)
        })
    }
    private static fetchContacts = () => {

        ApiClient.getAcquaintances((data, status, error) => {
            const contacts = (data && data.results) || [] 
            ProfileManager.storeProfiles(contacts)
            ProfileManager.setContactListCache(contacts.map(i => i.id))
            ApplicationManager.applicationData.contactsLoaded = true 
            ApplicationManager.checkIfLoaded()
            ToastManager.showErrorToast(error)
        })
    }
    private static checkIfLoaded = () => {
        const data = ApplicationManager.applicationData
        const ready = data.dashboards.length > 0 && 
                        data.communitiesLoaded && 
                        data.contactsLoaded && 
                        data.profileLoaded 
        if(ready)
            ApplicationManager.setApplicationLoaded()
    }
    private static setApplicationLoaded = () => {
        ApplicationManager.getStore().dispatch(setApplicationLoadedAction(true))
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}