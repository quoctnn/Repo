import { Types } from "../utilities/Types";
import { nullOrUndefined } from '../utilities/Utilities';
import { UserProfile } from "../types/intrasocial_types";
import storageLocal from 'redux-persist/lib/storage'
import { persistReducer } from "redux-persist";

const INITIAL_STATE:{signedIn:boolean, authToken:string|null, profile:UserProfile|null} = 
{ signedIn: false, authToken:null, profile:null}
const auth = (state = INITIAL_STATE, action:any) => {
    switch(action.type) 
    {
        case Types.SET_SIGNED_IN:
            return { ...state, authToken:action.authToken}
        case Types.SET_SIGNED_IN_PROFILE:
        return { ...state, profile:action.profile, signedIn: !nullOrUndefined( action.profile),}
        default:
            return state;
    }
}
const persistConfig = {
    key: "auth",
    storage: storageLocal,
    blacklist: ["signedIn"]
  };
export default persistReducer(persistConfig, auth);