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
    static getTask = (taskId:number|string):Task|null => 
    {
        return TaskManager.getStore().getState().taskStore.byId[taskId]
    }
    static ensureTaskExists = (taskId:number|string, completion:(task:Task) => void) => 
    {
        if(!taskId.isNumber())
        {
            completion(null)
            return
        }
        let task = TaskManager.getTask(taskId)
        if(!task)
        {
            const id = parseInt(taskId.toString())
            ApiClient.getTask(id, (data, status, error) => {
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