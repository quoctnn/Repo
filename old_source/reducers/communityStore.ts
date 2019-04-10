import {Types} from "../utilities/Types"
import { Community } from "../types/intrasocial_types2";
const communityArray:Community[] = []

const INITIAL_STATE = { communities: communityArray}
const communityStore = (state = INITIAL_STATE, action) => {
    switch(action.type)
    {
        case Types.COMMUNITYSTORE_ADD_COMMUNITIES:
            {
                if(action.communities.length == 0)
                    return state;
                const combinedArrays:Community[] = [...state.communities, ...action.communities].sort((a:Community, b:Community) => {
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
                return { communities: finalArray }
            }
        case Types.COMMUNITYSTORE_ADD_COMMUNITY:
            let hasCommunity = state.communities.find((c) => {
                return c.id == action.community.id
            })
            if(hasCommunity)
            {
                return { ...state, communities: state.communities.map( (content) => content.id === action.community.id ? action.community : content )}
            }
            let s = { ...state, communities: state.communities.map((c) => c)}
            s.communities.push(action.community)
            return s
        case Types.COMMUNITYSTORE_RESET:
            return {communities:[]}
        default:
            return state;
    }
}
export default communityStore