import { combineReducers } from 'redux'
import { Event } from "../types/intrasocial_types";
import { shallowCompareFields } from '../utilities/Utilities';
export enum EventStoreActionTypes {
    AddEvents = 'eventstore.add_events',
    UpdateEvent = 'eventstore.update_event',
    RemoveEvent = 'eventstore.remove_event',
    Reset = 'eventstore.reset',
}
export interface AddEventsAction{
    type:string
    events:Event[]
    force?:boolean
}
export interface ResetEventsAction{
    type:string
}
export const addEventsAction = (events: Event[]):AddEventsAction => ({
    type: EventStoreActionTypes.AddEvents,
    events
})
export const updateEventAction = (event: Partial<Event>):AddEventsAction => ({
    type: EventStoreActionTypes.UpdateEvent,
    events:[event as Event]
})
export const resetEventsAction = ():ResetEventsAction => ({
    type: EventStoreActionTypes.Reset,
})
​const resetEvents = (state, action:ResetEventsAction) => {
    
    return {};
}
​​const resetEventIds = (state, action:ResetEventsAction) => {
    
    return []
}
const shouldUpdate = (oldEvent:Event, newEvent:Event) => {
    if(!oldEvent)
        return true
    const fieldsUpdated = !shallowCompareFields(["avatar", "cover_cropped", "slug", "invited", "pending"], oldEvent, newEvent)
    if(fieldsUpdated)
    {
        return true
    }
    return new Date(newEvent.updated_at).getTime() > new Date(oldEvent.updated_at).getTime()
}
const addEvents = (state, action:AddEventsAction) => {
    let events = action.events
    let newState = {  ...state }
    events.forEach(c => {
        let id = c.id
        let old = state[id]
        if(action.force || shouldUpdate(old, c)) // update
        {
            newState[c.id] = c
        }
    })
    return newState
}
const updateEvent = (state, action:AddEventsAction) => {
    const newObject = action.events[0] || {} as Partial<Event>
    const id = newObject.id
    if(!id)
        return state
    const oldObject = state[id]
    if(!oldObject)
        return state
    let newState = {  ...state }
    const updatedObject = Object.assign({...oldObject}, newObject)
    newState[id] = updatedObject
    return newState
}
const addEventIds = (state:number[], action:AddEventsAction) => {
    
    let events = action.events
    let newState = [...state]
    events.forEach(c => {
        let id = c.id
        if(state.indexOf(id) == -1)
        {
            newState.push(id)
        }
    })
    return newState
}

export interface RemoveEventAction{
    type:string
    event:number
}
export const removeEventAction = (event: number):RemoveEventAction => ({
    type: EventStoreActionTypes.RemoveEvent,
    event
})
const removeEvent = (state:Object, action:RemoveEventAction) => {
    const event = action.event
    if(state.hasOwnProperty(event))
    {
        const newState = {  ...state }
        delete newState[event]
        return newState
    }
    return state
}
const removeEventId = (state:number[], action:RemoveEventAction) => {
    
    const event = action.event
    const st = [...state]
    st.remove(event)
    return st
}
export const eventsById = (state = {}, action:ResetEventsAction & AddEventsAction & RemoveEventAction ) => 
{
    switch(action.type) {
        case EventStoreActionTypes.AddEvents: return addEvents(state, action);
        case EventStoreActionTypes.UpdateEvent: return updateEvent(state, action);
        case EventStoreActionTypes.RemoveEvent: return removeEvent(state, action)
        case EventStoreActionTypes.Reset: return resetEvents(state, action)
        default : return state;
    }
}
export const allEvents = (state:number[] = [], action) => 
{
    switch(action.type) {
        case EventStoreActionTypes.AddEvents: return addEventIds(state, action)
        case EventStoreActionTypes.RemoveEvent: return removeEventId(state, action)
        case EventStoreActionTypes.Reset: return resetEventIds(state, action)
        default : return state;
    }
}
export const eventStore = combineReducers({
    byId : eventsById,
    allIds : allEvents
})