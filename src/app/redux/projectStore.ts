import { combineReducers } from 'redux'
import { Project } from "../types/intrasocial_types";
import { shallowCompareFields } from '../utilities/Utilities';
export enum ProjectStoreActionTypes {
    AddProjects = 'projectstore.add_projects',
    Reset = 'projectstore.reset',
}
export interface AddProjectsAction{
    type:string
    projects:Project[]
    force?:boolean
}
export interface ResetProjectsAction{
    type:string
}
export const addProjectsAction = (projects: Project[], force?:boolean):AddProjectsAction => ({
    type: ProjectStoreActionTypes.AddProjects,
    projects,
    force
})
export const resetProjectsAction = ():ResetProjectsAction => ({
    type: ProjectStoreActionTypes.Reset,
})
​const resetProjects = (state, action:ResetProjectsAction) => {
    
    return {};
}
​​const resetProjectIds = (state, action:ResetProjectsAction) => {
    
    return []
}
const shouldUpdate = (oldProject:Project, newProject:Project) => {
    if(!oldProject)
        return true
    const fieldsUpdated = !shallowCompareFields(["avatar", "cover", "slug"], oldProject, newProject)
    if(fieldsUpdated)
    {
        return true
    }
    return new Date(newProject.updated_at).getTime() > new Date(oldProject.updated_at).getTime()
}
const addProjects = (state, action:AddProjectsAction) => {
    let projects = action.projects
    let newState = {  ...state }
    projects.forEach(c => {
        let id = c.id
        let old = state[id]
        if(action.force || shouldUpdate(old, c)) // update
        {
            newState[c.id] = c
        }
    })
    return newState
}
const addProjectIds = (state:number[], action:AddProjectsAction) => {
    
    let projects = action.projects
    let newState = [...state]
    projects.forEach(c => {
        let id = c.id
        if(state.indexOf(id) == -1)
        {
            newState.push(id)
        }
    })
    return newState
}
export const projectsById = (state = {}, action:ResetProjectsAction & AddProjectsAction ) => 
{
    switch(action.type) {
        case ProjectStoreActionTypes.AddProjects: return addProjects(state, action);
        case ProjectStoreActionTypes.Reset: return resetProjects(state, action)
        default : return state;
    }
}
export const allProjects = (state:number[] = [], action) => 
{
    switch(action.type) {
        case ProjectStoreActionTypes.AddProjects: return addProjectIds(state, action)
        case ProjectStoreActionTypes.Reset: return resetProjectIds(state, action)
        default : return state;
    }
}
export const projectStore = combineReducers({
    byId : projectsById,
    allIds : allProjects
})