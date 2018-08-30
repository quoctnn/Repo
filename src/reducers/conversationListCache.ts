import {Types} from "../utilities/Types"

const conversationsArray:number[] = [
]
const INITIAL_STATE = { conversations: conversationsArray, total:0}
const conversationListCache = (state = INITIAL_STATE, action) => {
    switch(action.type)
    {
        case Types.SET_CONVERSATION_LIST_CACHE:
        {
            return { ...state , conversations: action.conversations, total: action.total}
        }
        case Types.APPEND_CONVERSATION_LIST_CACHE:
        {
            let arr = state.conversations.map( (content) => content).concat(action.conversations)
            return { ...state, conversations: arr}
        }
        case Types.RESET_CONVERSATION_LIST_CACHE:
            return { conversations: []}
        default:
            return state;
    }
}
export default conversationListCache