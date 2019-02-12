import { combineReducers } from 'redux'
import { Project } from "../types/intrasocial_types";
export enum ProjectStoreActionTypes {
    AddProjects = 'projectstore.add_projects',
    Reset = 'projectstore.reset',
}
export interface AddProjectsAction{
    type:string
    projects:Project[]
}
export interface ResetProjectsAction{
    type:string
}
export const addProjectsAction = (projects: Project[]):AddProjectsAction => ({
    type: ProjectStoreActionTypes.AddProjects,
    projects
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
const addProjects = (state, action:AddProjectsAction) => {
    let projects = action.projects
    let newState = {  ...state }
    projects.forEach(c => {
        let id = c.id
        let old = state[id]
        if(!old || new Date(old.updated_at) < new Date(c.updated_at)) // update
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