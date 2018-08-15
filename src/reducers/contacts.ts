import { AvatarStateColor } from '../components/general/Avatar';
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
    USER_ACTIVE = "active",//green
    USER_AWAY = "away", //orange
    USER_UNAVAILABLE = "unavailable", //nothing
    USER_DO_NOT_DISTURB = "dnd", //red
    USER_VACATION = "vacation",//gray
    USER_INVISIBLE = "invisible"//nothing
}
export const avatarStateColorForUserProfile = (userProfile:UserProfile) => {
    switch(userProfile.user_status)
    {
        case UserStatus.USER_ACTIVE: return AvatarStateColor.GREEN;
        case UserStatus.USER_AWAY: return AvatarStateColor.ORANGE;
        case UserStatus.USER_DO_NOT_DISTURB: return AvatarStateColor.RED;
        case UserStatus.USER_VACATION: return AvatarStateColor.GRAY;
        default: return AvatarStateColor.NONE
    }
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
            let hasContact = state.contactsArray.find((c) => {
                return c.id == action.user.id
            })
            if(hasContact)
            {
                return { ...state, contactsArray: state.contactsArray.map( (content) => content.id === action.user.id ? action.user : content )}
            }
            let s = { ...state, contactsArray: state.contactsArray.map((c) => c)}
            s.contactsArray.push(action.user)
            return s
        default:
            return state;
    }
}
export default contacts