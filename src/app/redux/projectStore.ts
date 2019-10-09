import { combineReducers } from 'redux'
import { Project } from "../types/intrasocial_types";
import { shallowCompareFields } from '../utilities/Utilities';
export enum ProjectStoreActionTypes {
    AddProjects = 'projectstore.add_projects',
    UpdateProject = 'projectstore.update_project',
    RemoveProject = 'projectstore.remove_project',
    Reset = 'projectstore.reset',
}
export interface AddProjectsAction{
    type:string
    projects:Project[]
    force?:boolean
}
export interface RemoveProjectAction{
    type:string
    project:number
}
export interface ResetProjectsAction{
    type:string
}
export const addProjectsAction = (projects: Project[], force?:boolean):AddProjectsAction => ({
    type: ProjectStoreActionTypes.AddProjects,
    projects,
    force
})
export const updateProjectAction = (project: Partial<Project>):AddProjectsAction => ({
    type: ProjectStoreActionTypes.UpdateProject,
    projects:[project as Project]
})

export const removeProjectAction = (project: number):RemoveProjectAction => ({
    type: ProjectStoreActionTypes.RemoveProject,
    project
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
const updateProject = (state, action:AddProjectsAction) => {
    const newObject = action.projects[0] || {} as Partial<Project>
    const id = newObject.id
    if(!id)
        return state
    const oldObject = state[id]
    if(!oldObject)
        return state
    let newState = {  ...state }
    const updatedObject = Object.assign({...oldObject}, newObject)
    newState[id] = updatedObject
    return newState
}
const shouldUpdate = (oldProject:Project, newProject:Project) => {
    if(!oldProject)
        return true
    const fieldsUpdated = !shallowCompareFields(["avatar", "cover_cropped", "slug"], oldProject, newProject)
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
const removeProject = (state:Object, action:RemoveProjectAction) => {
    const project = action.project
    if(state.hasOwnProperty(project))
    {
        const newState = {  ...state }
        delete newState[project]
        return newState
    }
    return state
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
const removeProjectId = (state:number[], action:RemoveProjectAction) => {
    
    const project = action.project
    const st = [...state]
    st.remove(project)
    return st
}
export const projectsById = (state = {}, action:ResetProjectsAction & AddProjectsAction & RemoveProjectAction) => 
{
    switch(action.type) {
        case ProjectStoreActionTypes.AddProjects: return addProjects(state, action);
        case ProjectStoreActionTypes.UpdateProject: return updateProject(state, action);
        case ProjectStoreActionTypes.RemoveProject: return removeProject(state, action)
        case ProjectStoreActionTypes.Reset: return resetProjects(state, action)
        default : return state;
    }
}
export const allProjects = (state:number[] = [], action) => 
{
    switch(action.type) {
        case ProjectStoreActionTypes.AddProjects: return addProjectIds(state, action)
        case ProjectStoreActionTypes.RemoveProject: return removeProjectId(state, action)
        case ProjectStoreActionTypes.Reset: return resetProjectIds(state, action)
        default : return state;
    }
}
export const projectStore = combineReducers({
    byId : projectsById,
    allIds : allProjects
})