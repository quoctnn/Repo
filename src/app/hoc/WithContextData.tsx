import * as React from 'react';
import { Project, Group, Community, UserProfile, Event, Conversation, Task, ContextSegmentKey, ContextNaturalKey, Linkable, IdentifiableObject, Permissible } from '../types/intrasocial_types';
import { ContextManager } from '../managers/ContextManager';
import { CommunityManager } from '../managers/CommunityManager';
import { ProfileManager } from '../managers/ProfileManager';
import { ConversationManager } from '../managers/ConversationManager';
import { EventController } from '../managers/EventController';
import { ProjectController } from '../managers/ProjectController';
import { GroupController } from '../managers/GroupController';
import * as H from 'history';
import { TaskController } from '../managers/TaskController';
import { ReduxState } from '../redux';
import { connect } from 'react-redux';
import { EventSubscription } from 'fbemitter';
import { NotificationCenter } from '../utilities/NotificationCenter';
export const ContextDataResolverComponentLogContextDataNotification = "ContextDataResolverComponentLogContextDataNotification"
export class ContextData{
    loading:boolean = false
    //
    task?:Task
    project?:Project
    event?:Event
    group?:Group
    //
    conversation?:Conversation
    community?:Community
    profile?:UserProfile

    constructor(conversation:Conversation, 
                community:Community, 
                profile:UserProfile,
                task:Task,
                project:Project,
                event:Event,
                group:Group,
                loading:boolean, 
                ){
                    this.conversation = conversation
                    this.community = community
                    this.task = task
                    this.profile = profile
                    this.project = project
                    this.event = event
                    this.group = group
                    this.loading = loading

    }
    getContextObject = (contextNaturalKey:ContextNaturalKey):Permissible & IdentifiableObject & Linkable => {
        switch (contextNaturalKey) {
            case ContextNaturalKey.COMMUNITY:return this.community
            case ContextNaturalKey.USER:return this.profile
            case ContextNaturalKey.CONVERSATION:return this.conversation
            case ContextNaturalKey.GROUP:return this.group
            case ContextNaturalKey.PROJECT:return this.project
            case ContextNaturalKey.EVENT:return this.event
            case ContextNaturalKey.TASK:return this.task
            default:
                break;
        }
    } 
    toString = () => {
        return `loading:${this.loading}, 
        community:${this.community}, 
        task:${this.task}, 
        profile:${this.profile}, 
        project:${this.project}, 
        event:${this.event}, 
        group:${this.group}, 
        conversation:${this.conversation}`   
    }

}
const contextData = React.createContext<ContextData>(null);
export const ContextDataConsumer = contextData.Consumer
export const ContextDataProvider = contextData.Provider
export type ContextDataProps = {
    contextData: ContextData;
}
export function withContextData<P extends ContextDataProps>(Component: React.ComponentType<P>) {
    return function C(props: Pick<P, Exclude<keyof P, keyof ContextDataProps>>) {
      return (
        <ContextDataConsumer>
          {(theme) => <Component {...props as P} contextData={theme} />}
        </ContextDataConsumer>
      )
    }
}
type OwnProps = {
    
}
type ReduxStateProps = {
    profileId?:number|string
    profile?:UserProfile
    communityId?: number|string
    community?:Community
    conversationId?:number|string
    conversation?:Conversation
    eventId:number|string
    projectId:number|string
    groupId:number|string
    taskId:number
}
type ContextDataResolverProps = { location:H.Location<any> } & ReduxStateProps & OwnProps
type ContextDataResolverState = {
}

class ContextDataResolverComponent extends React.Component<ContextDataResolverProps, ContextDataResolverState> {

    eventResolver:EventController = null
    projectResolver:ProjectController = null
    groupResolver:GroupController = null
    taskResolver:TaskController = null

    community?:Community = null
    communityLoading:boolean = false
    conversation?:Conversation = null
    conversationLoading:boolean = false
    profile?:UserProfile = null
    profileLoading:boolean = false
    private mounted = false
    private observers:EventSubscription[] = []
    constructor(props: ContextDataResolverProps) {
        super(props)
        this.state = {
        }
        this.eventResolver = new EventController(props.eventId, this.handleControllerUpdated)
        this.projectResolver = new ProjectController(props.projectId, this.handleControllerUpdated)
        this.groupResolver = new GroupController(props.groupId, this.handleControllerUpdated)
        this.taskResolver = new TaskController(props.taskId, this.handleControllerUpdated)
        if(this.props.communityId)
            this.handleCommunityUpdate(this.props.communityId)
        if(this.props.profileId)
            this.handleProfileUpdate(this.props.profileId)
        if(this.props.conversationId)
            this.handleConversationUpdate(this.props.conversationId)
    }
    componentDidMount = () => {
        this.mounted = true
        const observer1 = NotificationCenter.addObserver(ContextDataResolverComponentLogContextDataNotification, this.processLogContextDataNotification)
        this.observers.push(observer1)
    }
    processLogContextDataNotification = (...args:any[]) => {
        console.log("ContextData", this.getData())
    }
    tryForceUpdate = () => {
        if(this.mounted)
            this.forceUpdate()
    }
    UNSAFE_componentWillUpdate = (nextProps:ContextDataResolverProps) => {
        if(this.props.groupId != nextProps.groupId)
        {
            this.groupResolver.updateId(nextProps.groupId)
        }
        if(this.props.projectId != nextProps.projectId)
        {
            this.projectResolver.updateId(nextProps.projectId)
        }
        if(this.props.eventId != nextProps.eventId)
        {
            this.eventResolver.updateId(nextProps.eventId)
        }
        if(this.props.taskId != nextProps.taskId)
        {
            this.taskResolver.updateId(nextProps.taskId)
        }
        ///
        if(this.props.communityId != nextProps.communityId)
        {
            this.handleCommunityUpdate(nextProps.communityId)
        }
        if(this.props.conversationId != nextProps.conversationId)
        {
            this.handleConversationUpdate(nextProps.conversationId)
        }
        if(this.props.profileId != nextProps.profileId)
        {
            this.handleProfileUpdate(nextProps.profileId)
        }
    }
    handleConversationUpdate = (id:number|string) => {
        this.conversation = null
        this.conversationLoading = !!id
        if(id)
        {
            ConversationManager.ensureConversationExists(id, (conversation) => {
                if(conversation)
                {
                    if(id == conversation.id)
                    {
                        this.conversation = conversation
                        this.conversationLoading = false
                        this.tryForceUpdate()
                    }
                }
                else if(this.conversationLoading){
                    this.conversationLoading = false
                    this.tryForceUpdate()
                }
            })
        }
    }
    handleProfileUpdate = (id:number|string) => {
        this.profile = null
        this.profileLoading = !!id
        if(id)
        {
            ProfileManager.ensureProfileExists(id, (profile) => {
                if(profile)
                {
                    if(id == profile.id || id == profile.slug_name)
                    {
                        this.profile = profile
                        this.profileLoading = false
                        this.tryForceUpdate()
                    }
                }
                else if(this.profileLoading){
                    this.profileLoading = false
                    this.tryForceUpdate()
                }
            })
        }
    }
    handleCommunityUpdate = (id:number|string) => {
        this.community = null
        this.communityLoading = !!id
        if(id)
        {
            CommunityManager.ensureCommunityExists(id, (community) => {
                if(community)
                {
                    if(id == community.id || id == community.slug_name)
                    {
                        this.community = community
                        this.communityLoading = false
                        this.tryForceUpdate()
                    }
                }
                else if(this.communityLoading){
                    this.communityLoading = false
                    this.tryForceUpdate()
                }
            })
        }
    }
    handleControllerUpdated = () => {
        this.tryForceUpdate() 
    }
    getData = () => {
        const {community, communityLoading, profile, profileLoading, conversation, conversationLoading} = this
        const currentCommunity = this.props.community || community
        const currentCommunityLoading = this.props.community ? false : communityLoading

        const currentProfile = this.props.profile || profile
        const currentProfileLoading = this.props.profile ? false : profileLoading

        const currentConversation = this.props.conversation || conversation
        const currentConversationLoading = this.props.conversation ? false : conversationLoading

        const event = this.eventResolver.event
        const eventLoading = this.eventResolver.isLoading
        const project = this.projectResolver.project
        const projectLoading = this.projectResolver.isLoading
        const group = this.groupResolver.group
        const groupLoading = this.groupResolver.isLoading
        const task = this.taskResolver.task
        const taskLoading = this.taskResolver.isLoading
        
        const loading = currentCommunityLoading || eventLoading || groupLoading || projectLoading || currentProfileLoading || currentConversationLoading || taskLoading
        const data:ContextData = new ContextData(currentConversation, currentCommunity, currentProfile, task, project, event, group, loading)
        return data
    }
    render = () => {
        const data = this.getData()
        console.log("DATA",data.toString())
        return <ContextDataProvider value={data}>
                {this.props.children}
            </ContextDataProvider>
    }
}

const mapStateToProps = (state: ReduxState, ownProps: ContextDataResolverProps): ReduxStateProps => {
    const contextDict = ContextManager.pathToDictionary(ownProps.location.pathname)
    const eventId = contextDict[ContextSegmentKey.EVENT]
    const projectId = contextDict[ContextSegmentKey.PROJECT]
    const groupId = contextDict[ContextSegmentKey.GROUP]
    const taskId = contextDict[ContextSegmentKey.TASK]

    const profileId = contextDict[ContextSegmentKey.USER]
    const profile = profileId && ProfileManager.getProfile(profileId)

    const communityId = contextDict[ContextSegmentKey.COMMUNITY]
    const community = communityId && CommunityManager.getCommunity(communityId)

    const conversationId = contextDict[ContextSegmentKey.CONVERSATION]
    const conversation = conversationId && ConversationManager.getConversation(conversationId)
    return {
        profileId: profile ? null : profileId,
        communityId: community ? null : communityId,
        conversationId: conversation ? null : conversationId,
        eventId,
        projectId,
        groupId,
        taskId:taskId && parseInt(taskId),
        profile,
        community,
        conversation
    }
}
export const ContextDataResolver = connect<ReduxStateProps, {}, OwnProps>(mapStateToProps)(ContextDataResolverComponent)