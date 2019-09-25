import storageLocal from 'redux-persist/lib/storage'
import { persistReducer } from "redux-persist";
import { Settings } from '../utilities/Settings';
export enum ApplicationActionTypes {
    SetApplicationLoaded = 'application.set.loaded',
    SetVersion = "application.set.version",
    Reset = 'application.reset',
}
export interface ApplicationData {
    loaded:boolean
    version:string
}
export interface SetApplicationLoadedAction{
    type:ApplicationActionTypes
    loaded:boolean
}
export interface SetApplicationVersionAction{
    type:ApplicationActionTypes
    loaded:boolean
}
export interface ResetApplicationAction{
    type:ApplicationActionTypes
}
const INITIAL_STATE:ApplicationData = {
    loaded:false,
    version:Settings.compatMajor  + "."  + Settings.compatMinor,
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
            return {loaded:false, version:Settings.compatMajor  + "."  + Settings.compatMinor}
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