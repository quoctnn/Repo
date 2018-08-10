import {Types} from "../utilities/Types"
import {UpdateProfileAction} from "../actions/Actions"
const profile = (state = null, action:UpdateProfileAction) => {
    switch(action.type) 
    {
        case Types.SET_PROFILE:
            return action.profile
        default:
            return state;
    }
}
export default profile