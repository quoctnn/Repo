import {Types} from "../utilities/Types"


export class CommunityEvents
{
    total:number
    community_id: number
    events:number[]
    constructor(events:number[], community_id:number, total:number)
    {
        this.events = events
        this.community_id = community_id
        this.total = total
    }
    appendEvents(events:number[])
    {
        this.events.concat(events)
    }
}
const eventsArray:CommunityEvents[] = [
]


const INITIAL_STATE = { events: eventsArray}
const eventListCache = (state = INITIAL_STATE, action) => {
    switch(action.type)
    {
        case Types.SET_COMMUNITY_EVENTS_CACHE:
        {
            let arr = state.events.filter( (content) => content.community_id != action.community  )
            arr.push(new CommunityEvents(action.events, action.community, action.total))
            return { ...state , events: arr}
        }
        case Types.APPEND_COMMUNITY_EVENTS_CACHE:
        {
            let arr = state.events.map( (content) => content.community_id === action.community ? new CommunityEvents(content.events.concat(action.events), content.community_id, content.total)  : content )
            return { ...state, events: arr}
        }
        case Types.RESET_COMMUNITY_EVENTS_CACHE:
            return { events: []}
        default:
            return state;
    }
}
export default eventListCache