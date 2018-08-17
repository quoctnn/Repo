import {Types} from "../utilities/Types"

const contactsArray:number[] = [
]
const INITIAL_STATE = { contacts: contactsArray}
const contactListCache = (state = INITIAL_STATE, action) => {
    switch(action.type)
    {
        case Types.SET_CONTACT_LIST_CACHE:
        {
            return { ...state , contacts: action.contacts}
        }
        case Types.APPEND_CONTACT_LIST_CACHE:
        {
            let arr = state.contacts.map( (content) => content).concat(action.contacts)
            return { ...state, contacts: arr}
        }
        case Types.RESET_CONTACT_LIST_CACHE:
            return { contacts: []}
        default:
            return state;
    }
}
export default contactListCache