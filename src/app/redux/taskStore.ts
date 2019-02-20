import { combineReducers } from 'redux'
import { Task } from "../types/intrasocial_types";
export enum TaskStoreActionTypes {
    AddTasks = 'taskstore.add_task',
    Reset = 'taskstore.reset',
}
export interface AddTasksAction{
    type:string
    tasks:Task[]
}
export interface ResetTasksAction{
    type:string
}
export const addTasksAction = (tasks: Task[]):AddTasksAction => ({
    type: TaskStoreActionTypes.AddTasks,
    tasks
})
export const resetTasksAction = ():ResetTasksAction => ({
    type: TaskStoreActionTypes.Reset,
})
​const resetTasks = (state, action:ResetTasksAction) => {
    
    return {};
}
​​const resetTaskIds = (state, action:ResetTasksAction) => {
    
    return []
}
const addTasks = (state, action:AddTasksAction) => {
    let tasks = action.tasks
    let newState = {  ...state }
    tasks.forEach(c => {
        let id = c.id
        let old = state[id]
        if(!old || new Date(old.updated_at) < new Date(c.updated_at)) // update
        {
            newState[c.id] = c
        }
    })
    return newState
}
const addTaskIds = (state:number[], action:AddTasksAction) => {
    
    let tasks = action.tasks
    let newState = [...state]
    tasks.forEach(c => {
        let id = c.id
        if(state.indexOf(id) == -1)
        {
            newState.push(id)
        }
    })
    return newState
}
export const tasksById = (state = {}, action:ResetTasksAction & AddTasksAction ) => 
{
    switch(action.type) {
        case TaskStoreActionTypes.AddTasks: return addTasks(state, action);
        case TaskStoreActionTypes.Reset: return resetTasks(state, action)
        default : return state;
    }
}
export const allTasks = (state:number[] = [], action) => 
{
    switch(action.type) {
        case TaskStoreActionTypes.AddTasks: return addTaskIds(state, action)
        case TaskStoreActionTypes.Reset: return resetTaskIds(state, action)
        default : return state;
    }
}
export const taskStore = combineReducers({
    byId : tasksById,
    allIds : allTasks
})