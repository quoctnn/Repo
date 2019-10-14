import { Event, IdentifiableObject } from '../types/intrasocial_types';
import {ApiClient} from '../network/ApiClient';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventStreamMessageType } from '../network/ChannelEventStream';
import { EventSubscription } from 'fbemitter';
export const EventPartialUpdateNotification = "EventPartialUpdateNotification"
export class EventController
{
    private object:Event = null
    private observers:EventSubscription[] = []
    private objectId:string|number = null
    private onEventUpdated:(event:Event, loading:boolean) => void
    private loading:boolean = false
    constructor(id:string|number, onEventUpdated:(event:Event, loading:boolean) => void)
    {
        this.objectId = id
        this.onEventUpdated = onEventUpdated
        this.observers.push(NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.EVENT_UPDATE, this.processEventUpdate))
        this.observers.push(NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.EVENT_REMOVE, this.processEventRemove))
        this.observers.push(NotificationCenter.addObserver(EventPartialUpdateNotification, this.processPartialUpdate))
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
    get event(){
        return this.object
    }
    get isLoading(){
        return this.loading
    }
    private processPartialUpdate = (...args:any[]) => {
        const data:Partial<Event> = args[0]
        if(this.object && data && data.id && this.isSameId(data.id))
        {
            const updatedObject = Object.assign({...this.object}, data)
            this.setObject(updatedObject, false)
        }
    }
    isSameId = (id:number) => {
        return this.objectId == id || this.object && this.object.id == id
    }
    private processEventRemove = (...args:any[]) => {
        const eventId = args[0]["event_id"] as number
        if(this.isSameId(eventId))
            this.setObject(null, false)
    }
    private processEventUpdate = (...args:any[]) => {
        const eventId = args[0]["event_id"] as number
        if(this.isSameId(eventId))
            this.fetchObject()
    }
    private setObject = (event:Event, loading:boolean) => {
        this.object = event
        this.loading = loading
        this.sendUpdate()
    }
    private sendUpdate = () => {
        this.onEventUpdated(this.object, this.loading)
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
        ApiClient.getEvent(loadingId, (data, status, error) => {
            if(this.objectId == loadingId)
                this.setObject(data, false)
        })
    }
    static partialUpdate = (object:Partial<Event> & IdentifiableObject) => {
        NotificationCenter.push(EventPartialUpdateNotification,[object])
    }
    deinit = () => {
        this.observers.forEach(o => o.remove())
        this.observers = null
    }
}