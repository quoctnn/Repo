import {Types} from "../utilities/Types"
import { Group } from "../types/intrasocial_types2";

const groupsArray:Group[] = []

const INITIAL_STATE = { groups: groupsArray}
const groupStore = (state = INITIAL_STATE, action) => {
    switch(action.type)
    {
        case Types.GROUPSTORE_ADD_GROUPS:
            {
                if(action.groups.length == 0)
                    return state;
                const combinedArrays:Group[] = [...state.groups, ...action.groups].sort((a:Group, b:Group) => {
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
                return { groups: finalArray }
            }
        case Types.GROUPSTORE_ADD_GROUP:
            let hasGroup = state.groups.find((c) => {
                return c.id == action.group.id
            })
            if(hasGroup)
            {
                return { ...state, groups: state.groups.map( (content) => content.id === action.group.id ? action.group : content )}
            }
            let s = { ...state, groups: state.groups.map((c) => c)}
            s.groups.push(action.group)
            return s
        case Types.GROUPSTORE_RESET:
            return {groups:[]}
        default:
            return state;
    }
}
export default groupStore