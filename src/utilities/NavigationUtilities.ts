import { UserProfile } from '../types/intrasocial_types';
import * as H from 'history';
import { Routes } from './Routes';
import { ProfileManager } from '../managers/ProfileManager';
import { CommunityManager } from '../managers/CommunityManager';
import { GroupManager } from '../managers/GroupManager';

export class NavigationUtilities {
    static navigateToProfile = (history: H.History, profile:UserProfile) => {
        history.push(Routes.PROFILES + profile.slug_name)
    }
    static navigateToProfileId = (history: H.History, profile:number) => 
    {
        ProfileManager.ensureProfilesExists([profile],() => {
           const p = ProfileManager.getProfile(profile)
           history.push(Routes.PROFILES + p.slug_name)
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
                history.push(Routes.COMMUNITY + community.slug_name)
         })
    }
    static navigateToGroup = (history: H.History, groupId:number) => 
    {
         GroupManager.ensureGroupExists(groupId, (group) => {
                const groupUrl = `${Routes.COMMUNITY}${group.community}/group/${group.slug}`
                history.push(groupUrl)
         })
    }
    
}

  