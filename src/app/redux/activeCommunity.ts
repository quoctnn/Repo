export enum ActiveCommunityActionTypes {
    SetActiveCommunity = 'activecommunity.set_active_community',
}
const INITIAL_STATE = {
  activeCommunity: 0
}
export interface SetActiveCommunityAction{
    type:string
    activeCommunity:number
}
export const SetActiveCommunityAction = (index: number):SetActiveCommunityAction => ({
    type: ActiveCommunityActionTypes.SetActiveCommunity,
    activeCommunity: index
})
const activeCommunity = (state = INITIAL_STATE, action:SetActiveCommunityAction) => {
  switch (action.type) {
    case ActiveCommunityActionTypes.SetActiveCommunity:
      return { ...state, language: action.activeCommunity }
    default:
      return state
  }
};
export default activeCommunity;
