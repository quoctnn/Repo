import { UserProfile } from '../types/intrasocial_types2';
import * as H from 'history';
import Routes from './Routes';
import { ProfileManager } from '../managers/ProfileManager';
import { CommunityManager } from '../managers/CommunityManager';
import { GroupManager } from '../managers/GroupManager';
import { ProjectManager } from '../managers/ProjectManager';
import { TaskManager } from '../managers/TaskManager';
import { EventManager } from '../managers/EventManager';

export class NavigationUtilities {
    static navigateToProfile = (history: H.History, profile:UserProfile) => {
        history.push(Routes.profileUrl(profile.slug_name))
    }
    static navigateToProfileId = (history: H.History, profile:number) => 
    {
        ProfileManager.ensureProfilesExists([profile],() => {
           const p = ProfileManager.getProfileById(profile)
           history.push(Routes.profileUrl(p.slug_name))
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
                history.push(Routes.communityUrl(community.slug_name, true))
         })
    }
    static navigateToGroup = (history: H.History, groupId:number) => 
    {
         GroupManager.ensureGroupExists(groupId, (group) => {
            CommunityManager.ensureCommunityExists(group.community, (community) => {
                const groupUrl = Routes.groupUrl(community.slug_name, group.slug)
                history.push(groupUrl)
            })
         })
    }
    static navigateToTask = (history: H.History, taskId:number) => 
    {
        TaskManager.ensureTaskExists(taskId, (task) => 
        {
            ProjectManager.ensureProjectExists(task.project, (project) => {
                CommunityManager.ensureCommunityExists(project.community, (community) => {
                    const taskUrl = Routes.taskUrl(community.slug_name, project.slug, taskId)
                    history.push(taskUrl)
                })
            })
        })
    }
    static navigateToEvent = (history: H.History, eventId:number) => 
    {
         EventManager.ensureEventExists(eventId, (event) => {
            CommunityManager.ensureCommunityExists(event.community, (community) => {
                const eventUrl = Routes.eventUrl(community.slug_name, event.slug)
                history.push(eventUrl)
            })
         })
    }
    static navigateToProject = (history: H.History, projectId:number) => 
    {
         ProjectManager.ensureProjectExists(projectId, (project) => {
            CommunityManager.ensureCommunityExists(project.community, (community) => {
                const projectUrl = Routes.projectUrl(community.slug_name, project.slug)
                history.push(projectUrl)
            })
         })
    }
    static navigateToDevTool = (history: H.History) => 
    {
        history.push(Routes.DEVELOPER_TOOL)
    }
}

  