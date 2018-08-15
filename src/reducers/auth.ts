import {Types} from "../utilities/Types"
const INITIAL_STATE = { signedIn: false}
const auth = (state = INITIAL_STATE, action) => {
    switch(action.type) 
    {
        case Types.SET_SIGNED_IN:
            return { ...state, signedIn: action.signedIn}
        default:
            return state;
    }
}
export default auth