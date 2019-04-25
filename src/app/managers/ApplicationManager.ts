import {  Store } from 'redux';
import { ReduxState } from '../redux/index';
import { setApplicationLoadedAction } from '../redux/application';
import { AuthenticationManager } from './AuthenticationManager';
import { Dashboard } from '../types/intrasocial_types';
import ApiClient, { ListOrdering } from '../network/ApiClient';
import { ToastManager } from './ToastManager';
import { CommunityManager } from './CommunityManager';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { ProfileManager } from './ProfileManager';
import { resetCommunitiesAction } from '../redux/communityStore';
import { resetGroupsAction } from '../redux/groupStore';
import { resetProfilesAction } from '../redux/profileStore';
import { resetProjectsAction } from '../redux/projectStore';
import { resetEventsAction } from '../redux/eventStore';
import { resetTasksAction } from '../redux/taskStore';
export type ApplicationData = {
    dashboards:Dashboard[]
    communitiesLoaded:boolean
    profileLoaded:boolean
    contactsLoaded:boolean
}
type RequestObject = {
    name:string,
    action:(completion:() => void) => void
}
export type LoadingProgress = {
    percent:number,
    text:string
}
export const ApplicationManagerLoadingProgressNotification = "ApplicationManagerLoadingProgressNotification"
export abstract class ApplicationManager
{
    private static applicationData:ApplicationData = null
    static setup = () =>
    {
        ApplicationManager.resetData(false)
    }
    private static resetData = (resetCachedData:boolean) => {
        
        ApplicationManager.applicationData = {dashboards:[], communitiesLoaded:false, profileLoaded:false, contactsLoaded:false}
        if(resetCachedData)
        {
            const store = ApplicationManager.getStore()
            // Clean up cached data
            store.dispatch(resetCommunitiesAction())
            store.dispatch(resetGroupsAction())
            store.dispatch(resetProfilesAction())

            store.dispatch(resetProjectsAction())
            store.dispatch(resetEventsAction())
            store.dispatch(resetTasksAction())
        }
    }
    static getDashboards = (category:string) => {
        const all = ApplicationManager.applicationData.dashboards
        const dashboards = all.filter(d => d.category == category)
        dashboards.forEach(db => db.grid_layouts.sort((a, b) => b.min_width - a.min_width))
        return dashboards
    }
    static loadApplication = (resetCachedData:boolean) => {
        console.log("loadApplication")
        ApplicationManager.resetData(resetCachedData)
        ApplicationManager.getStore().dispatch(setApplicationLoadedAction(false))

        const requests:RequestObject[] = []
        requests.push({name:"Dashboards", action:ApplicationManager.fetchDashboards})
        requests.push({name:"Communities", action:ApplicationManager.fetchCommunities})
        requests.push({name:"Profile", action:ApplicationManager.fetchProfile})
        requests.push({name:"Contacts", action:ApplicationManager.fetchContacts})
        let requestsCompleted = 0
        const requestCompleter = (request:RequestObject) => {
            requestsCompleted += 1
            const progress:LoadingProgress = {percent: requestsCompleted / requests.length, text:request.name}
            NotificationCenter.push(ApplicationManagerLoadingProgressNotification,[progress])
            if(requestsCompleted == requests.length)
                ApplicationManager.setApplicationLoaded()
        }

        const progress:LoadingProgress = {percent: 0, text:"Fetching data"}
        NotificationCenter.push(ApplicationManagerLoadingProgressNotification,[progress])
        //run requests
        requests.forEach(r => {
            r.action(() => {requestCompleter(r)})
        })
    }
    private static fetchDashboards = (completion:() => void) => {
        ApiClient.getDashboards((data, status, error) => {
            const dashboards = (data && data.results) || []
            ApplicationManager.applicationData.dashboards = dashboards
            completion()
            ToastManager.showErrorToast(error)
        })
    }
    private static fetchCommunities = (completion:() => void) => {
        ApiClient.getCommunities(true, ListOrdering.ALPHABETICAL, 100, 0, (data, status, error) => {
            const communities = (data && data.results) || []
            CommunityManager.storeCommunities(communities)
            completion()
            ToastManager.showErrorToast(error)
        })
    }
    private static fetchProfile = (completion:() => void) => {
        ApiClient.getMyProfile((data, status, error) => {
            const profile = data
            AuthenticationManager.setAuthenticatedUser(profile)
            completion()
            ToastManager.showErrorToast(error)
        })
    }
    private static fetchContacts = (completion:() => void) => {
        ApiClient.getProfiles(100, 0, (data, status, error) => {
            const profiles = (data && data.results) || []
            ProfileManager.storeProfiles(profiles)
            completion()
            ToastManager.showErrorToast(error)
        })
    }
    private static setApplicationLoaded = () => {
        const authUser = AuthenticationManager.getAuthenticatedUser()
        authUser && CommunityManager.setInitialCommunity(authUser.active_community)
        ApplicationManager.getStore().dispatch(setApplicationLoadedAction(true))
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}