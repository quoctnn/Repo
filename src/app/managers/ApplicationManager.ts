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
import { resetConversationsAction } from '../redux/conversationStore';
import { resetMessageQueueAction } from '../redux/messageQueue';
import { resetEndpointAction } from '../redux/endpoint';
import { resetThemeAction } from '../redux/theme';
import { resetActiveCommunityAction } from '../redux/activeCommunity';
import { resetEmbedlyStoreAction } from '../components/general/embedly/redux';
import { resetUnreadNotificationsAction } from '../redux/unreadNotifications';
import { FavoriteManager } from './FavoriteManager';
import { Settings } from '../utilities/Settings';
import { Redirect } from 'react-router';
import { noop } from 'react-select/lib/utils';

export type ApplicationData = {
    dashboards:{[key:string]:Dashboard}
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
export const ApplicationManagerApplicationLoadedNotification = "ApplicationManagerApplicationLoadedNotification"
export abstract class ApplicationManager
{
    private static applicationData:ApplicationData = null
    static setup = () =>
    {
        ApplicationManager.resetData(false)
        ApplicationManager.fetchBackendInfo((result, message) => {
            switch (result) {
                case (0):
                    break;
                default:
                    alert("There was an error while connecting to the backend server.\n" + message);
            }
        })
    }
    private static resetData = (resetCachedData:boolean) => {

        ApplicationManager.applicationData = {dashboards:{}, communitiesLoaded:false, profileLoaded:false, contactsLoaded:false}
        if(resetCachedData)
        {
            ApplicationManager.reset()
        }
    }
    static getDashboards = (category:string) => {
        const all = ApplicationManager.applicationData.dashboards[category]
        all.grid_layouts = all.grid_layouts.sort((a, b) => b.min_width - a.min_width)
        return all
    }
    static setDashboard = (dashboard:Dashboard) => {
        ApplicationManager.applicationData.dashboards[dashboard.category] = dashboard
    }
    static setAllDashboards = (dashboards:Dashboard[]) => {
        const db = {}
        dashboards.forEach(d => {
            db[d.category] = d
        })
        ApplicationManager.applicationData.dashboards = db
    }
    static loadApplication = (resetCachedData:boolean) => {
        ApplicationManager.resetData(resetCachedData)
        ApplicationManager.getStore().dispatch(setApplicationLoadedAction(false))
        const requests:RequestObject[] = []
        requests.push({name:"Dashboards", action:ApplicationManager.fetchDashboards})
        requests.push({name:"Communities", action:ApplicationManager.fetchCommunities})
        requests.push({name:"Profile", action:ApplicationManager.fetchProfile})
        requests.push({name:"Contacts", action:ApplicationManager.fetchContacts})
        requests.push({name:"Favorites", action:ApplicationManager.fetchFavorites})
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
    private static fetchBackendInfo = (completion:(result:number, message:string) => void) => {
        const compatibility = {major_version: Settings.compatMajor, minor_version: Settings.compatMinor}
        ApiClient.getBackendVersionInfo((data, status) => {
            const versionInfo = data;
            if (status == 'error') {
                completion(2, "Could not establish contact with backend server!")
            } else {
                if (compatibility.major_version < versionInfo.major_version ||
                        (compatibility.minor_version < versionInfo.minor_version &&
                         compatibility.major_version == versionInfo.major_version)
                    ) {
                        completion(1, "Backend version: " + versionInfo.version_string + " is not compatible")
                    }
                else {
                    console.info("Backend version:", versionInfo);
                }
            }
            completion(0, "")
        })
    }

    private static fetchDashboards = (completion:() => void) => {
        ApiClient.getDashboards((data, status, error) => {
            const dashboards = (data && data.results) || []
            ApplicationManager.setAllDashboards(dashboards)
            completion()
            ToastManager.showErrorToast(error)
        })
    }
    private static fetchCommunities = (completion:() => void) => {
        ApiClient.getCommunities(true, ListOrdering.ALPHABETICALLY, 100, 0, (data, status, error) => {
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
    private static fetchFavorites = (completion:() => void) => {
        ApiClient.getFavorites((data, status, error) => {
            const favorites = (data && data.results) || []
            FavoriteManager.setFavoritesToStore(favorites)
            completion()
            //ToastManager.showErrorToast(error)
        })
    }
    private static setApplicationLoaded = () => {
        const authUser = AuthenticationManager.getAuthenticatedUser()
        authUser && CommunityManager.setInitialCommunity(authUser.active_community)
        ApplicationManager.getStore().dispatch(setApplicationLoadedAction(true))
        NotificationCenter.push(ApplicationManagerApplicationLoadedNotification,[])
    }
    static hardReset = () => {
        const dispatch = ApplicationManager.getStore().dispatch
        dispatch(resetMessageQueueAction())
        dispatch(resetEndpointAction())
        dispatch(resetEmbedlyStoreAction())
        ApplicationManager.softReset()
    }
    static softReset = () => {
        const dispatch = ApplicationManager.getStore().dispatch
        dispatch(resetThemeAction())
        dispatch(resetActiveCommunityAction())
        ApplicationManager.reset()
    }
    private static reset = () => {
        const dispatch = ApplicationManager.getStore().dispatch
        dispatch(resetCommunitiesAction())
        dispatch(resetProfilesAction())
        dispatch(resetGroupsAction())
        dispatch(resetEventsAction())
        dispatch(resetTasksAction())
        dispatch(resetProjectsAction())
        dispatch(resetConversationsAction())
        dispatch(resetUnreadNotificationsAction())
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}