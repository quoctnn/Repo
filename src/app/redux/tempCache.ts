import { Conversation } from "../types/intrasocial_types";
import storageLocal from 'redux-persist/lib/storage'
import { persistReducer } from "redux-persist";

export enum TempCacheActionTypes {
    SetTemporaryConversation = 'temp.set_conversation',
}
export type TempCache = {
    conversation?:Conversation
}
const INITIAL_STATE:TempCache = {
    conversation: null
}
export interface SetTemporaryAction{
    type:TempCacheActionTypes
    conversation?:Conversation
}
export const setTemporaryConversationAction = (conversation: Conversation):SetTemporaryAction => ({
    type: TempCacheActionTypes.SetTemporaryConversation,
    conversation
})
const tempCache = (state = INITIAL_STATE, action:SetTemporaryAction):TempCache => {
  switch (action.type) {
    case TempCacheActionTypes.SetTemporaryConversation:
      return { ...state, conversation: action.conversation }
    default:
      return state;
  }
}
const persistConfig = {
    key: "tempCache",
    storage: storageLocal,
    blacklist: ["conversation"]
  };
export default persistReducer(persistConfig, tempCache)