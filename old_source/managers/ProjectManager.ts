import {  Store } from 'redux';
import { RootState } from '../reducers';
import * as Actions from '../actions/Actions';
import { Project } from '../types/intrasocial_types2';
import ApiClient from '../network/ApiClient';
export abstract class ProjectManager
{
    static setup = () => 
    {
    }
    static storeProjects = (projects:Project[]) => {
        ProjectManager.getStore().dispatch(Actions.storeProjects(projects))
    }
    static getProject = (projectId:string):Project|null => 
    {
        const isNumber = projectId.isNumber()
        var project = ProjectManager.getStore().getState().projectStore.projects.find(g => g.slug == projectId)
        if(!project && isNumber)
        {
            return ProjectManager.getStore().getState().projectStore.projects.find(g => g.id == parseInt(projectId))
        }
        return project
    }
    static ensureProjectExists = (projectId:number, completion:(project:Project) => void) => 
    {
        const id = projectId.toString()
        let group = ProjectManager.getProject(id)
        if(!group)
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
            completion(group)
        }

    }
    private static getStore = ():Store<RootState,any> =>
    {
        return window.store 
    }
}