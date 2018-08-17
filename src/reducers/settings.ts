import {Types} from "../utilities/Types"
const availableLanguages = ["en", "es", "no"]
const INITIAL_STATE = { language: 0 , availableLanguages:availableLanguages, awayTimeout:300}
const settings = (state = INITIAL_STATE, action) => {
    switch(action.type) 
    {
        case Types.SET_LANGUAGE:
            return { ...state, language: action.language}
        case Types.SET_AWAY_TIMEOUT:
            return { ...state, awayTimeout: action.timeout}
        default:
            return state;
    }
}
export default settings