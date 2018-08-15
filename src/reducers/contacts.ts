import {Types} from "../utilities/Types"
export enum LoginType {
    API = 1,
    NATIVE
}
export interface UserProfile {
    absolute_url: string,
    avatar: string,
    avatar_thumbnail: string,
    cover: string,
    cover_cropped: string,
    first_name: string,
    id: number,
    last_name: string,
    relationship: any,
    username: string,
    uuid:string,
    user_status:UserStatus
}
export enum UserStatus
{
    USER_ACTIVE = "active",
    USER_AWAY = "away",
    USER_UNAVAILABLE = "unavailable",
    USER_DO_NOT_DISTURB = "dnd",
    USER_VACATION = "vacation",
    USER_INVISIBLE = "invisible"

    
}

const contactsArray:UserProfile[] = [
]


const INITIAL_STATE = { contactsArray: contactsArray}
const contacts = (state = INITIAL_STATE, action) => {
    switch(action.type)
    {
        case Types.SET_CONTACTS:
            return { ...state, contactsArray: action.contacts}
        case Types.UPDATE_CONTACT:
            return { ...state, contactsArray: state.contactsArray.map( (content) => content.id === action.user.id ? action.user : content )}
        default:
            return state;
    }
}
export default contacts