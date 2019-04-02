export enum ResolvedContextActionTypes {
    SetResolvedContext = 'resolvedcontext.set_resolved_context',
    Reset = 'resolvedcontext.reset'
}
export type ResolvedContext = {
    //community
    communitySlug?:string
    communityId?:number
    communityResolved?:number
    //project
    projectSlug?:string
    projectId?:number
    projectResolved?:number
    //task 
    taskSlug?:string
    taskId?:number
    taskResolved?:number
    //group
    groupSlug?:string
    groupId?:number
    groupResolved?:number
    //profile
    profileSlug?:string
    profileId?:number
    profileResolved?:number
}
export type ResetResolvedContext = {
    type:string
}
const INITIAL_STATE:ResolvedContext = {
    communityId: -1
}
export interface SetResolvedContextAction{
    type:string
    context:ResolvedContext
}
export const setResolvedContextAction = (context:{}):SetResolvedContextAction => ({
    type: ResolvedContextActionTypes.SetResolvedContext,
    context
})
export const resetResolvedContext = ():ResetResolvedContext => ({
    type: ResolvedContextActionTypes.Reset
})
const resolvedContext = (state = INITIAL_STATE, action:SetResolvedContextAction & ResetResolvedContext) => {
  switch (action.type) {
    case ResolvedContextActionTypes.SetResolvedContext: return {...state, ...action.context}
    case ResolvedContextActionTypes.Reset: return {}
    default:
      return state
  }
};
export default resolvedContext;
