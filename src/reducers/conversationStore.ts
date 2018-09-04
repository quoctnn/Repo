import {Types} from "../utilities/Types"
import { UserProfile } from './profileStore';


export class Message 
{
    id:number
    pending?:boolean
    uid:string
    user:number
    conversation:number
    text:string
    attachment:any
    created_at:string 
    updated_at:string
    read_by:number[]
}
export class Conversation
{
    id:number
    title:string
    users:number[]
    archived_by: number[]
    last_message:Message
    read_by:any[]
    absolute_url:string
    created_at:Date
    updated_at:Date
    constructor(id:number,
        title:string,
        users:number[],
        archived_by: number[],
        last_message:Message,
        read_by:any[],
        absolute_url:string,
        created_at:Date,
        updated_at:Date)
    {
        this.id = id
        this.title = title
        this.users = users
        this.archived_by = archived_by
        this.last_message = last_message
        this.read_by = read_by
        this.absolute_url = absolute_url
        this.created_at = created_at
        this.updated_at = updated_at
    }
}
const conversationsArray:Conversation[] = [
]
const INITIAL_STATE = { conversations: conversationsArray}
const conversationStore = (state = INITIAL_STATE, action) => {
    switch(action.type)
    {
        case Types.CONVERSATIONSTORE_ADD_CONVERSATIONS:
            {
                if(action.conversations.length == 0)
                    return state;
                const combinedArrays:Conversation[] = [...state.conversations, ...action.conversations].sort((a:Conversation, b:Conversation) => {
                    return a.id - b.id
                })
                const finalArray = combinedArrays.reduce((prev, cur, index, array) => {
       
                    let toReturn
                    const lastObj = prev[prev.length - 1]
                    if(lastObj.id !== cur.id){
                      toReturn = prev.concat(cur)
                    } 
                    else if (new Date(lastObj.updated_at ) < new Date(cur.updated_at))
                    {
                      prev.splice((prev.length - 1), 1, cur)
                      toReturn = prev
                    }
                    else {
                     toReturn = prev   
                    }
            
                    return toReturn
                  }, [combinedArrays[0]])
                return { conversations: finalArray }
            }
        case Types.CONVERSATIONSTORE_ADD_CONVERSATION:
            let hasConversation = state.conversations.find((c) => {
                return c.id == action.conversation.id
            })
            if(hasConversation)
            {
                return { ...state, conversations: state.conversations.map( (content) => content.id === action.conversation.id ? action.conversation : content )}
            }
            let s = { ...state, conversations: state.conversations.map((c) => c)}
            s.conversations.push(action.conversation)
            return s
        case Types.CONVERSATIONSTORE_RESET:
            return {conversations:[]}
        default:
            return state;
    }
}
export default conversationStore