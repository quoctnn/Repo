import {Types} from "../utilities/Types"

//debug
export const setApiEndpoint = (index:number) => ({
    type: Types.SET_API_ENDPOINT,
    apiEndpoint: index
})
export const setAccessTokenOverride = (accessToken:string) => ({
    type: Types.SET_ACCESS_TOKEN_OVERRIDE,
    accessToken: accessToken
})
export const setAuthorizationData = (token:string, cookie:string) => ({
    type: Types.SET_AUTORIZATION_DATA,
    token: token,
    cookie: cookie
})

//settings
export const setLanguage = (index:number) => ({
    type: Types.SET_LANGUAGE,
    language: index
})