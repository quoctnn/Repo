import { combineReducers } from 'redux'
import { Event } from "../types/intrasocial_types";
import { shallowCompareFields } from '../utilities/Utilities';
export enum EventStoreActionTypes {
    AddEvents = 'eventstore.add_event',
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
    const fieldsUpdated = !shallowCompareFields(["avatar", "cover_cropped", "slug"], oldEvent, newEvent)
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
export const eventsById = (state = {}, action:ResetEventsAction & AddEventsAction ) => 
{
    switch(action.type) {
        case EventStoreActionTypes.AddEvents: return addEvents(state, action);
        case EventStoreActionTypes.Reset: return resetEvents(state, action)
        default : return state;
    }
}
export const allEvents = (state:number[] = [], action) => 
{
    switch(action.type) {
        case EventStoreActionTypes.AddEvents: return addEventIds(state, action)
        case EventStoreActionTypes.Reset: return resetEventIds(state, action)
        default : return state;
    }
}
export const eventStore = combineReducers({
    byId : eventsById,
    allIds : allEvents
})