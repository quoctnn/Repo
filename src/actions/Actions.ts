import {Types} from "../utilities/Types"

//debug
export const setApiEndpoint = (index:number) => ({
    type: Types.SET_API_ENDPOINT,
    apiEndpoint: index
})
export const setAccessToken = (accessToken:string) => ({
    type: Types.SET_ACCESS_TOKEN,
    accessToken: accessToken
})

//settings
export const setLanguage = (index:number) => ({
    type: Types.SET_LANGUAGE,
    language: index
})