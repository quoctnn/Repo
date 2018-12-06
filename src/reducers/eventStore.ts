import {Types} from "../utilities/Types"
import { Event } from "../types/intrasocial_types";

const eventsArray:Event[] = []

const INITIAL_STATE = { events: eventsArray}
const eventStore = (state = INITIAL_STATE, action) => {
    switch(action.type)
    {
        case Types.EVENTSTORE_ADD_EVENTS:
            {
                if(action.events.length == 0)
                    return state;
                const combinedArrays:Event[] = [...state.events, ...action.events].sort((a:Event, b:Event) => {
                    return a.id - b.id
                })
                const finalArray = combinedArrays.reduce((prev, cur, index, array) => {

                    let toReturn
                    const lastObj = prev[prev.length - 1]
                    if(lastObj.id !== cur.id){
                      toReturn = prev.concat(cur)
                    }
                    else if (new Date(lastObj.updated_at) < new Date(cur.updated_at))
                    {
                      prev.splice((prev.length - 1), 1, cur)
                      toReturn = prev
                    }
                    else {
                     toReturn = prev
                    }

                    return toReturn
                  }, [combinedArrays[0]])
                return { events: finalArray }
            }
        case Types.EVENTSTORE_ADD_EVENT:
            let hasEvent = state.events.find((c) => {
                return c.id == action.event.id
            })
            if(hasEvent)
            {
                return { ...state, events: state.events.map( (content) => content.id === action.event.id ? action.event : content )}
            }
            let s = { ...state, events: state.events.map((c) => c)}
            s.events.push(action.event)
            return s
        case Types.EVENTSTORE_RESET:
            return {events:[]}
        default:
            return state;
    }
}
export default eventStore