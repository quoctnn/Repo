import {  Store } from 'redux';
import { Event } from '../types/intrasocial_types';
import {ApiClient} from '../network/ApiClient';
import { ReduxState } from '../redux/index';
import { addEventsAction, eventStore } from '../redux/eventStore';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventStreamMessageType } from '../network/ChannelEventStream';
export abstract class EventManager
{
    static setup = () =>
    {
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.EVENT_NEW, EventManager.processEventNew)
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.EVENT_UPDATE, EventManager.processEventUpdate)
    }
    static processEventNew = (...args:any[]) => {
        const eventId = args[0]["event_id"] as number
        EventManager.updateEvent(eventId)
    }
    static processEventUpdate = (...args:any[]) => {
        const eventId = args[0]["event_id"] as number
        EventManager.updateEvent(eventId)
    }
    static updateEvent = (eventId:number) => (
        ApiClient.getEvent(eventId, (data, status, error) => {
            if(data)
            {
                EventManager.storeEvents([data])
            }
        })
    )
    static storeEvents = (events:Event[]) => {
        EventManager.getStore().dispatch(addEventsAction(events))
    }
    static getEvent = (eventId:string):Event|null =>
    {
        const eventStore = EventManager.getStore().getState().eventStore
        const isNumber = eventId.isNumber()
        var eventKey = eventStore.allIds.find(cid =>  {
            const comm =  eventStore.byId[cid]
            return comm.slug == eventId
        })
        if(eventKey)
        {
            return eventStore.byId[eventKey]
        }
        if(isNumber)
        {
            return EventManager.getEventById(parseInt(eventId))
        }
        return null
    }
    static getEventById = (eventId:number):Event|null =>
    {
        return EventManager.getStore().getState().eventStore.byId[eventId]
    }
    static ensureEventExists = (eventId:string|number, completion:(event:Event) => void, forceUpdate?: boolean) =>
    {
        const id = eventId.toString()
        let event = EventManager.getEvent(id)
        if(!event || forceUpdate)
        {
            ApiClient.getEvent(id, (data, status, error) => {
                if(data)
                {
                    EventManager.storeEvents([data])
                }
                else
                {
                    console.log("error fetching event", error)
                }
                completion(data)
            })
        }
        else
        {
            completion(event)
        }

    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}