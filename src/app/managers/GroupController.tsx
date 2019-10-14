import { Group, IdentifiableObject } from '../types/intrasocial_types';
import {ApiClient} from '../network/ApiClient';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventSubscription } from 'fbemitter';
import { EventStreamMessageType } from '../network/ChannelEventStream';
export const GroupPartialUpdateNotification = "GroupPartialUpdateNotification"
export class GroupController
{
    private object:Group = null
    private observers:EventSubscription[] = []
    private objectId:string|number = null
    private onGroupUpdated:(group:Group, loading:boolean) => void
    private loading:boolean = false
    constructor(group:string|number, onGroupUpdated:(group:Group, loading:boolean) => void)
    {
        this.objectId = group
        this.onGroupUpdated = onGroupUpdated
        this.observers.push(NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.GROUP_UPDATE, this.processGroupUpdate))
        this.observers.push(NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.GROUP_REMOVE, this.processGroupRemove))
        this.observers.push(NotificationCenter.addObserver(GroupPartialUpdateNotification, this.processPartialUpdate))
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
    get group(){
        return this.object
    }
    get isLoading(){
        return this.loading
    }
    private processPartialUpdate = (...args:any[]) => {
        const data:Partial<Group> = args[0]
        if(this.object && data && data.id && this.isSameId(data.id))
        {
            const updatedObject = Object.assign({...this.object}, data)
            this.setObject(updatedObject, false)
        }
    }
    isSameId = (id:number) => {
        return this.objectId == id || this.object && this.object.id == id
    }
    private processGroupRemove = (...args:any[]) => {
        const groupId = args[0]["group_id"] as number
        if(this.isSameId(groupId))
            this.setObject(null, false)
    }
    private processGroupUpdate = (...args:any[]) => {
        const groupId = args[0]["group_id"] as number
        if(this.isSameId(groupId))
            this.fetchObject()
    }
    private setObject = (group:Group, loading:boolean) => {
        this.object = group
        this.loading = loading
        this.sendUpdate()
    }
    private sendUpdate = () => {
        this.onGroupUpdated(this.object, this.loading)
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
        ApiClient.getGroup(this.objectId.toString(), (data, status, error) => {
            if(this.objectId == loadingId)
                this.setObject(data, false)
        })
    }
    static partialUpdate = (object:Partial<Group> & IdentifiableObject) => {
        NotificationCenter.push(GroupPartialUpdateNotification,[object])
    }
    deinit = () => {
        this.observers.forEach(o => o.remove())
        this.observers = null
    }
}