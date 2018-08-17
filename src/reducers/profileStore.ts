import {Types} from "../utilities/Types"
import { AvatarStateColor } from '../components/general/Avatar';

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
    user_status:UserStatus,
    biography:string, 
    last_seen:number,
    slug_name:string,
    updated_at:string
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
const profilesArray:UserProfile[] = []

const INITIAL_STATE = { profiles: profilesArray}
const profileStore = (state = INITIAL_STATE, action) => {
    switch(action.type)
    {
        case Types.PROFILESTORE_ADD_PROFILES:
            {
                if(action.profiles.length == 0)
                    return state;
                const combinedArrays:UserProfile[] = [...state.profiles, ...action.profiles].sort((a:UserProfile, b:UserProfile) => {
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
                return { profiles: finalArray }
            }
        case Types.PROFILESTORE_ADD_PROFILE:
            let hasProfile = state.profiles.find((c) => {
                return c.id == action.profile.id
            })
            if(hasProfile)
            {
                return { ...state, profiles: state.profiles.map( (content) => content.id === action.profile.id ? action.profile : content )}
            }
            let s = { ...state, profiles: state.profiles.map((c) => c)}
            s.profiles.push(action.profile)
            return s
        case Types.PROFILESTORE_RESET:
            return {profiles:[]}
        default:
            return state;
    }
}
export default profileStore