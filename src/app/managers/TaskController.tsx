import { Task, IdentifiableObject } from '../types/intrasocial_types';
import {ApiClient} from '../network/ApiClient';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventStreamMessageType } from '../network/ChannelEventStream';
import { EventSubscription } from 'fbemitter';
export const TaskPartialUpdateNotification = "TaskPartialUpdateNotification"
export class TaskController
{
    private object:Task = null
    private observers:EventSubscription[] = []
    private objectId:number = null
    private onTaskUpdated:(task:Task, loading:boolean) => void
    private loading:boolean = false
    constructor(task:number, onTaskUpdated:(task:Task, loading:boolean) => void)
    {
        this.objectId = task
        this.onTaskUpdated = onTaskUpdated
        this.observers.push(NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.TASK_UPDATE, this.processTaskUpdate))
        this.observers.push(NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.TASK_REMOVE, this.processTaskRemove))
        this.observers.push(NotificationCenter.addObserver(TaskPartialUpdateNotification, this.processPartialUpdate))
        this.fetchObject()
    }
    updateId = (id:number) => {
        if(this.objectId != id)
        {
            this.objectId = id
            this.setObject(null, false)
            this.fetchObject()
        }
    }
    get task(){
        return this.object
    }
    get isLoading(){
        return this.loading
    }
    private processPartialUpdate = (...args:any[]) => {
        const data:Partial<Task> = args[0]
        if(this.object && data && data.id && this.isSameId(data.id))
        {
            const updatedObject = Object.assign({...this.object}, data)
            this.setObject(updatedObject, false)
        }
    }
    isSameId = (id:number) => {
        return this.objectId == id || this.object && this.object.id == id
    }
    private processTaskRemove = (...args:any[]) => {
        const taskId = args[0]["task_id"] as number
        if(this.isSameId(taskId))
            this.setObject(null, false)
    }
    private processTaskUpdate = (...args:any[]) => {
        const taskId = args[0]["task_id"] as number
        if(this.isSameId(taskId))
            this.fetchObject()
    }
    private setObject = (task:Task, loading:boolean) => {
        this.object = task
        this.loading = loading
        this.sendUpdate()
    }
    private sendUpdate = () => {
        this.onTaskUpdated(this.object, this.loading)
    }
    private setLoadingWithUpdate = (loading:boolean) => {
        this.loading = loading
        this.sendUpdate()
    }
    private fetchObject = () =>
    {
        const loadingId = this.objectId
        if(!loadingId)
            return
        this.setLoadingWithUpdate(true)
        ApiClient.getTask(this.objectId, (data, status, error) => {
            if(this.objectId == loadingId)
                this.setObject(data, false)
        })
    }
    static partialUpdate = (object:Partial<Task> & IdentifiableObject) => {
        NotificationCenter.push(TaskPartialUpdateNotification,[object])
    }
    deinit = () => {
        this.observers.forEach(o => o.remove())
        this.observers = null
    }
}