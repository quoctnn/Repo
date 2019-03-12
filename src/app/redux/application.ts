import storageLocal from 'redux-persist/lib/storage'
import { persistReducer } from "redux-persist";
export enum ApplicationActionTypes {
    SetApplicationLoaded = 'application.set.loaded',
    Reset = 'application.reset',
}
export interface ApplicationData {
    loaded:boolean
}
export interface SetApplicationLoadedAction{
    type:string
    loaded:boolean
}
export interface ResetApplicationAction{
    type:string
}
const INITIAL_STATE:ApplicationData = {
    loaded:false
}
export const setApplicationLoadedAction = (loaded:boolean):SetApplicationLoadedAction => ({
    type: ApplicationActionTypes.SetApplicationLoaded,
    loaded
})
export const resetApplicationAction = ():ResetApplicationAction => ({
    type: ApplicationActionTypes.Reset
})
const application = (state = INITIAL_STATE, action:SetApplicationLoadedAction & ResetApplicationAction):ApplicationData => {
    switch(action.type) 
    {
        case ApplicationActionTypes.SetApplicationLoaded:
            return { ...state, loaded:action.loaded}
        case ApplicationActionTypes.Reset:
        return {loaded:false}
        default:
            return state;
    }
}
const persistConfig = {
    key: "application",
    storage: storageLocal,
    blacklist: ["loaded"]
  };
export default persistReducer(persistConfig, application)