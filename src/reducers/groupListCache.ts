import {Types} from "../utilities/Types"


export class CommunityGroups
{
    total:number
    community_id: number
    groups:number[]
    constructor(groups:number[], community_id:number, total:number)
    {
        this.groups = groups
        this.community_id = community_id
        this.total = total
    }
    appendGroups(groups:number[])
    {
        this.groups.concat(groups)
    }
}
const groupsArray:CommunityGroups[] = [
]


const INITIAL_STATE = { groups: groupsArray}
const groupListCache = (state = INITIAL_STATE, action) => {
    switch(action.type)
    {
        case Types.SET_COMMUNITY_GROUPS_CACHE:
        {
            let arr = state.groups.filter( (content) => content.community_id != action.community  )
            arr.push(new CommunityGroups(action.groups, action.community, action.total))
            return { ...state , groups: arr}
        }
        case Types.APPEND_COMMUNITY_GROUPS_CACHE:
        {
            let arr = state.groups.map( (content) => content.community_id === action.community ? new CommunityGroups(content.groups.concat(action.groups), content.community_id, content.total)  : content )
            return { ...state, groups: arr}
        }
        case Types.RESET_COMMUNITY_GROUPS_CACHE:
            return { groups: []}
        default:
            return state;
    }
}
export default groupListCache