import {  Store } from 'redux';
import { Task } from '../types/intrasocial_types';
import ApiClient from '../network/ApiClient';
import { ReduxState } from '../redux';
import { addTasksAction } from '../redux/taskStore';
export abstract class TaskManager
{
    static setup = () => 
    {
    }
    static storeTasks = (tasks:Task[]) => {
        TaskManager.getStore().dispatch(addTasksAction(tasks))
    }
    static getTask = (taskId:number):Task|null => 
    {
        return TaskManager.getStore().getState().taskStore.byId[taskId]
    }
    static ensureTaskExists = (taskId:number, completion:(task:Task) => void) => 
    {
        let task = TaskManager.getTask(taskId)
        if(!task)
        {
            ApiClient.getTask(taskId, (data, status, error) => {
                if(data)
                {
                    TaskManager.storeTasks([data])
                }
                else 
                {
                    console.log("error fetching task", error)
                }
                completion(data)
            })
        }
        else 
        {
            completion(task)
        }

    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store 
    }
}