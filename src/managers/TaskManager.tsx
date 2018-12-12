import {  Store } from 'redux';
import { RootState } from '../reducers';
import * as Actions from '../actions/Actions';
import { Task } from '../types/intrasocial_types';
import ApiClient from '../network/ApiClient';
export abstract class TaskManager
{
    static setup = () => 
    {
    }
    static storeTasks = (tasks:Task[]) => {
        TaskManager.getStore().dispatch(Actions.storeTasks(tasks))
    }
    static getTask = (taskId:number):Task|null => 
    {
        return TaskManager.getStore().getState().taskStore.tasks.find(p => p.id == taskId)
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
    private static getStore = ():Store<RootState,any> =>
    {
        return window.store 
    }
}