export enum ActiveCommunityActionTypes {
    SetActiveCommunity = 'activecommunity.set_active_community',
}
const defaultActiveCommunity = 0
const INITIAL_STATE = {
  activeCommunity: defaultActiveCommunity
}
export interface SetActiveCommunityAction{
    type:string
    activeCommunity:number
}
export const setActiveCommunityAction = (index: number):SetActiveCommunityAction => ({
    type: ActiveCommunityActionTypes.SetActiveCommunity,
    activeCommunity: index
})
export const resetActiveCommunityAction = ():SetActiveCommunityAction => ({
  type: ActiveCommunityActionTypes.SetActiveCommunity,
  activeCommunity: defaultActiveCommunity
})
const activeCommunity = (state = INITIAL_STATE, action:SetActiveCommunityAction) => {
  switch (action.type) {
    case ActiveCommunityActionTypes.SetActiveCommunity:
      return { ...state, activeCommunity: action.activeCommunity }
    default:
      return state
  }
};
export default activeCommunity;
