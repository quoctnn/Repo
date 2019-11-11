import { Project, IdentifiableObject } from '../types/intrasocial_types';
import {ApiClient} from '../network/ApiClient';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventStreamMessageType } from '../network/ChannelEventStream';
import { EventSubscription } from 'fbemitter';
export const ProjectPartialUpdateNotification = "ProjectPartialUpdateNotification"
export class ProjectController
{
    private object:Project = null
    private observers:EventSubscription[] = []
    private objectId:string|number = null
    private onProjectUpdated:(project:Project, loading:boolean) => void
    private loading:boolean = false
    constructor(project:string|number, onProjectUpdated:(project:Project, loading:boolean) => void)
    {
        this.objectId = project
        this.onProjectUpdated = onProjectUpdated
        this.observers.push(NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.PROJECT_UPDATE, this.processProjectUpdate))
        this.observers.push(NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.PROJECT_REMOVE, this.processProjectRemove))
        this.observers.push(NotificationCenter.addObserver(ProjectPartialUpdateNotification, this.processPartialUpdate))
        this.fetchObject()
    }
    updateId = (id:string|number) => {
        if(this.objectId != id)
        {
            this.objectId = id
            this.setObject(null, false)
            this.fetchObject()
        }
    }
    get project(){
        return this.object
    }
    get isLoading(){
        return this.loading
    }
    private processPartialUpdate = (...args:any[]) => {
        const data:Partial<Project> = args[0]
        if(this.object && data && data.id && this.isSameId(data.id))
        {
            const updatedObject = Object.assign({...this.object}, data)
            this.setObject(updatedObject, false)
        }
    }
    isSameId = (id:number) => {
        return this.objectId == id || this.object && this.object.id == id
    }
    private processProjectRemove = (...args:any[]) => {
        const projectId = args[0]["id"] as number
        if(this.isSameId(projectId))
            this.setObject(null, false)
    }
    private processProjectUpdate = (...args:any[]) => {
        const projectId = args[0]["id"] as number
        if(this.isSameId(projectId))
            this.fetchObject()
    }
    private setObject = (project:Project, loading:boolean) => {
        this.object = project
        this.loading = loading
        this.sendUpdate()
    }
    private sendUpdate = () => {
        this.onProjectUpdated(this.object, this.loading)
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
        ApiClient.getProject(this.objectId, (data, status, error) => {
            if(this.objectId == loadingId)
                this.setObject(data, false)
        })
    }
    static partialUpdate = (object:Partial<Project> & IdentifiableObject) => {
        NotificationCenter.push(ProjectPartialUpdateNotification,[object])
    }
    deinit = () => {
        this.observers.forEach(o => o.remove())
        this.observers = null
    }
}