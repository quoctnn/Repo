import {  Store } from 'redux';
import { RootState } from '../reducers';
import * as Actions from '../actions/Actions';
import { Event } from '../types/intrasocial_types';
import ApiClient from '../network/ApiClient';
import eventStore from '../reducers/eventStore';
export abstract class EventManager
{
    static setup = () => 
    {
    }
    static storeEvents = (events:Event[]) => {
        EventManager.getStore().dispatch(Actions.storeEvents(events))
    }
    static getEvent = (eventId:string):Event|null => 
    {
        const isNumber = eventId.isNumber()
        var event = EventManager.getStore().getState().eventStore.events.find(c => c.slug == eventId)
        if(!event && isNumber)
        {
            return EventManager.getStore().getState().eventStore.events.find(c => c.id == parseInt(eventId))
        }
        return event
    }
    static ensureEventExists = (eventId:string|number, completion:(event:Event) => void) => 
    {
        const id = eventId.toString()
        let event = EventManager.getEvent(id)
        if(!event)
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
    private static getStore = ():Store<RootState,any> =>
    {
        return window.store 
    }
}