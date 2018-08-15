import { AvatarStateColor } from '../components/general/Avatar';
import {Types} from "../utilities/Types"

export enum LoginType {
    API = 1,
    NATIVE
}
export interface Community {
    absolute_url: string,
    avatar: string,
    avatar_thumbnail: string,
    cover: string,
    cover_cropped: string,

    deactivated: boolean,
    id: number,
    members: number[],
    relationship: any,
    name: string,
    slug_name:string,
}
const communitiesArray:Community[] = [
]


const INITIAL_STATE = { communitiesArray: communitiesArray}
const communities = (state = INITIAL_STATE, action) => {
    switch(action.type)
    {
        case Types.SET_COMMUNITIES:
            return { ...state, communitiesArray: action.communities}
        case Types.UPDATE_COMMUNITY:
            let hasCommunity = state.communitiesArray.find((c) => {
                return c.id == action.community.id
            })
            if(hasCommunity)
            {
                return { ...state, communitiesArray: state.communitiesArray.map( (content) => content.id === action.community.id ? action.community : content )}
            }
            let s = { ...state, communitiesArray: state.communitiesArray.map((c) => c)}
            s.communitiesArray.push(action.community)
            return s
        default:
            return state;
    }
}
export default communities