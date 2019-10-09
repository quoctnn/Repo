import {  Store } from 'redux';
import { Project } from '../types/intrasocial_types';
import {ApiClient} from '../network/ApiClient';
import { ReduxState } from '../redux';
import { addProjectsAction, removeProjectAction } from '../redux/projectStore';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventStreamMessageType } from '../network/ChannelEventStream';
export abstract class ProjectManager
{
    static setup = () =>
    {
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.PROJECT_NEW, ProjectManager.processProjectNew)
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.PROJECT_UPDATE, ProjectManager.processProjectUpdate)
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.PROJECT_REMOVE, ProjectManager.processProjectRemove)
    }
    static processProjectRemove = (...args:any[]) => {
        const projectId = args[0]["project_id"] as number
        ProjectManager.removeProject(projectId)
    }
    static processProjectNew = (...args:any[]) => {
        const projectId = args[0]["project_id"] as number
        ProjectManager.updateProject(projectId)
    }
    static processProjectUpdate = (...args:any[]) => {
        const projectId = args[0]["project_id"] as number
        ProjectManager.updateProject(projectId)
    }
    static updateProject = (groupId:number) => (
        ApiClient.getProject(groupId, (data, status, error) => {
            if(data)
            {
                ProjectManager.storeProjects([data])
            }
        })
    )
    static storeProjects = (projects:Project[]) => {
        ProjectManager.getStore().dispatch(addProjectsAction(projects))
    }
    static removeProject = (project:number) => {
        ProjectManager.getStore().dispatch(removeProjectAction(project))
    }
    
    static getProjectById = (projectId:number):Project|null =>
    {
        return ProjectManager.getStore().getState().projectStore.byId[projectId]
    }
    static getProject = (projectId:string):Project|null =>
    {
        const projectStore = ProjectManager.getStore().getState().projectStore
        const isNumber = projectId.isNumber()
        var projectKey = projectStore.allIds.find(cid =>  {
            const comm =  projectStore.byId[cid]
            return comm.slug == projectId
        })
        if(projectKey)
        {
            return projectStore.byId[projectKey]
        }
        if(isNumber)
        {
            return projectStore.byId[parseInt(projectId)]
        }
        return null
    }
    static ensureProjectExists = (projectId:string|number, completion:(project:Project) => void, forceUpdate?: boolean) =>
    {
        const id = projectId.toString()
        let project = ProjectManager.getProject(id)
        if(!project || forceUpdate)
        {
            ApiClient.getProject(id, (data, status, error) => {
                if(data)
                {
                    ProjectManager.storeProjects([data])
                }
                else
                {
                    console.log("error fetching project", error)
                }
                completion(data)
            })
        }
        else
        {
            completion(project)
        }

    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}