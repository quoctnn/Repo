import {Types} from "../utilities/Types"
const availableLanguages = ["en", "es", "no"]
const INITIAL_STATE = { language: 0 , availableLanguages:availableLanguages, signedIn:false}
const settings = (state = INITIAL_STATE, action) => {
    switch(action.type) 
    {
        case Types.SET_LANGUAGE:
            return { ...state, language: action.language}
        case Types.SET_SIGNED_IN:
            return { ...state, signedIn: action.signedIn}
        default:
            return state;
    }
}
export default settings