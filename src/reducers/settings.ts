import {Types} from "../utilities/Types"
const availableLanguages = ["en", "es", "no"]
const INITIAL_STATE = { language: 0 , availableLanguages:availableLanguages}
const settings = (state = INITIAL_STATE, action) => {
    switch(action.type) 
    {
        case Types.SET_LANGUAGE:
            return { ...state, language: action.language}
        default:
            return state;
    }
}
export default settings