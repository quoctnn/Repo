import { UserProfile, ContextNaturalKey } from '../types/intrasocial_types';
import * as H from 'history';
import Routes from './Routes';
import { ProfileManager } from '../managers/ProfileManager';
import { CommunityManager } from '../managers/CommunityManager';
import { translate } from '../localization/AutoIntlProvider';

export class NavigationUtilities {

    private static routerNavigationPreventionReleaseCallback: () => void = null
    private static protectedNavigations = new Map<string, boolean>()

    static navigateToSignOut = (history: H.History) => {
        history.push(Routes.SIGNOUT)
    }
    static navigateToSearch = (history: H.History, query:string) => {
        history.push(Routes.searchUrl(query))
    }
    static navigateToNewsfeed = (history: H.History, contextNaturalKey?: ContextNaturalKey, contextObjectId?:number, includeSubContext?:boolean) => {
        history.push(Routes.newsfeedUrl(contextNaturalKey, contextObjectId, includeSubContext))
    }
    static navigateToProfile = (history: H.History, profile:UserProfile) => {
        history.push(Routes.profileUrl(profile.slug_name))
    }
    static navigateToConversation = (history: H.History, conversationId:number|string) =>
    {
        history.push(Routes.conversationUrl(conversationId, true))
    }
    static navigateToProfileId = (history: H.History, profile:number) =>
    {
        ProfileManager.ensureProfilesExists([profile],() => {
           const p = ProfileManager.getProfileById(profile)
            if (profile) {
                history.push(Routes.profileUrl(p.slug_name || p.id))
            }
        })
    }
    static navigateToUrl = (history: H.History, url:string) =>
    {
        var win = window.open(url, '_blank');
        win.focus();
    }
    static navigateToCommunity = (history: H.History, communityId:number) =>
    {
        CommunityManager.ensureCommunityExists(communityId, (community) => {
            if (community) {
                history.push(Routes.communityUrl(community.slug_name, true));
            }
        })
    }
    static navigateToDevTool = (history: H.History) =>
    {
        history.push(Routes.DEVELOPER_TOOL.path)
    }
    static getProtectedNavigationConfirmation = (message: string, callback: (ok: boolean) => void) => {
        const confirmed = NavigationUtilities.showProtectedNavigationConfirmation()
        if(confirmed)
        {
            NavigationUtilities.removeNavigationProtection()
        }
        callback(confirmed);
    }
    
    static showProtectedNavigationConfirmation = () => {
        return window.confirm(translate("prevent.navigation.text"))
    }
    private static removeNavigationProtection = () => {
        NavigationUtilities.protectedNavigations.clear()
        window.onbeforeunload = null
        NavigationUtilities.routerNavigationPreventionReleaseCallback && NavigationUtilities.routerNavigationPreventionReleaseCallback()
    }
    static isNavigationProtected = (keys:string[]) => {
        return keys.some(key => NavigationUtilities.protectedNavigations.has(key))
    }
    static protectNavigation = (key:string, enabled:boolean) => {
        enabled ? NavigationUtilities.protectedNavigations.set(key, enabled) : NavigationUtilities.protectedNavigations.delete(key)
        const protect = NavigationUtilities.protectedNavigations.size > 0
        if (protect){
            if(!window.onbeforeunload || !NavigationUtilities.routerNavigationPreventionReleaseCallback)
            {
                const dialogText = translate("prevent.navigation.text")
                window.onbeforeunload = function(e) {
                    e.preventDefault()
                    e.returnValue = dialogText;
                    return dialogText;
                }
                NavigationUtilities.routerNavigationPreventionReleaseCallback && NavigationUtilities.routerNavigationPreventionReleaseCallback()
                if(window.routerHistory)
                    NavigationUtilities.routerNavigationPreventionReleaseCallback = window.routerHistory.block(dialogText)
            }
        } else {
            NavigationUtilities.removeNavigationProtection()
        }
    }
}
