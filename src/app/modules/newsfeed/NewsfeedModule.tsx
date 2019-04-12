import * as React from 'react';
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import classnames from "classnames"
import "./NewsfeedModule.scss"
import ModuleMenu from '../ModuleMenu';
import ModuleMenuTrigger from '../ModuleMenuTrigger';
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import NewsfeedComponentRouted, { NewsfeedComponent } from './NewsfeedComponent';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import NewsfeedMenu, { NewsfeedMenuData, allowedSearchOptions } from './NewsfeedMenu';
import { ObjectAttributeType, ContextNaturalKey, StatusActions, Permission, Permissible } from '../../types/intrasocial_types';
import { ButtonGroup, Button } from 'reactstrap';
import { ContextSearchData } from '../../components/general/input/contextsearch/extensions';
import { translate } from '../../localization/AutoIntlProvider';
import ApiClient from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { convertElasticResultItem, ContextValue } from '../../components/general/input/ContextFilter';
import { ReduxState } from '../../redux';
import { ResolvedContext } from '../../redux/resolvedContext';
import { StatusComposerComponent } from '../../components/status/StatusComposerComponent';
import { CommunityManager } from '../../managers/CommunityManager';
import { ProjectManager } from '../../managers/ProjectManager';
import { TaskManager } from '../../managers/TaskManager';
import { GroupManager } from '../../managers/GroupManager';
import { ProfileManager } from '../../managers/ProfileManager';

type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
    contextObjectId:number
}
type DefaultProps = {

    includeSubContext:boolean
}
interface ReduxStateProps
{
    contextObjectId:number
    isResolvingContext:boolean
    contextObject:Permissible
}
interface ReduxDispatchProps
{
}
interface State
{
    menuVisible:boolean
    isLoading:boolean
    selectedSearchContext:ContextSearchData
    includeSubContext:boolean
    filter:ObjectAttributeType

    contextNaturalKey:ContextNaturalKey,
    contextObjectId:number
    contextTitle:string
    contextResolveError:string

    statusComposerFocus:boolean
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & DefaultProps & RouteComponentProps<any>

export type ResolvedContextObject = {
    contextNaturalKey:ContextNaturalKey
    contextObjectId:number
    resolved:number
}
export const resolveContextObject = (resolvedContext:ResolvedContext, contextNaturalKey:ContextNaturalKey):ResolvedContextObject => {
    if(!contextNaturalKey)
        return null
    if(contextNaturalKey == ContextNaturalKey.COMMUNITY)
        return {contextNaturalKey, contextObjectId:resolvedContext.communityId, resolved:resolvedContext.communityResolved}
    if(contextNaturalKey == ContextNaturalKey.PROJECT)
        return {contextNaturalKey, contextObjectId:resolvedContext.projectId, resolved:resolvedContext.projectResolved}
    if(contextNaturalKey == ContextNaturalKey.TASK)
        return {contextNaturalKey, contextObjectId:resolvedContext.taskId, resolved:resolvedContext.taskResolved}
    if(contextNaturalKey == ContextNaturalKey.GROUP)
        return {contextNaturalKey, contextObjectId:resolvedContext.groupId, resolved:resolvedContext.groupResolved}
    if(contextNaturalKey == ContextNaturalKey.USER)
        return {contextNaturalKey, contextObjectId:resolvedContext.profileId, resolved:resolvedContext.profileResolved}
    console.warn("resolveContextObject does not handle '"+contextNaturalKey+"'")
    return null
}
export const getContextObject = (contextNaturalKey:ContextNaturalKey, contextObjectId:number):Permissible => {
    if(!contextNaturalKey || !contextObjectId)
        return null
    if(contextNaturalKey == ContextNaturalKey.COMMUNITY)
        return CommunityManager.getCommunityById(contextObjectId)
    if(contextNaturalKey == ContextNaturalKey.PROJECT)
        return ProjectManager.getProjectById(contextObjectId)
    if(contextNaturalKey == ContextNaturalKey.TASK)
        return TaskManager.getTask(contextObjectId)
    if(contextNaturalKey == ContextNaturalKey.GROUP)
        return GroupManager.getGroupById(contextObjectId)
    if(contextNaturalKey == ContextNaturalKey.USER)
        return ProfileManager.getProfileById(contextObjectId)
    console.warn("getContextObject does not handle '"+contextNaturalKey+"'")
    return null
}
class NewsfeedModule extends React.Component<Props, State> {
    static defaultProps:DefaultProps = {
        includeSubContext:true
    }
    statuscomposer = React.createRef<HTMLDivElement>();
    newsfeedComponent:any = null;
    tempMenuData:NewsfeedMenuData = null
    availableFilters = [ObjectAttributeType.important, ObjectAttributeType.pinned, ObjectAttributeType.reminder, ObjectAttributeType.attention]
    constructor(props:Props) {
        super(props);
        this.state = {
            menuVisible:false,
            selectedSearchContext: new ContextSearchData({tokens:[], query:"", tags:[], filters:{}, stateTokens:[], originalText:""}),
            includeSubContext:props.includeSubContext,
            filter:null,
            isLoading:false,
            contextNaturalKey:undefined,
            contextObjectId:undefined,
            contextTitle:undefined,
            contextResolveError:undefined,
            statusComposerFocus:false
        }
        console.log("NewsfeedModule props", this.props)
    }
    componentDidUpdate = (prevProps:Props) => {
        //turn off loading spinner if feed is removed
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        return nextProps.breakpoint != this.props.breakpoint ||
                nextProps.contextNaturalKey != this.props.contextNaturalKey ||
                nextProps.contextObjectId != this.props.contextObjectId ||
                nextProps.isResolvingContext != this.props.isResolvingContext ||
                nextProps.includeSubContext != this.props.includeSubContext ||
                //state
                nextState.contextNaturalKey != this.state.contextNaturalKey ||
                nextState.contextObjectId != this.state.contextObjectId ||
                nextState.contextTitle != this.state.contextTitle ||
                nextState.contextResolveError != this.state.contextResolveError ||
                nextState.isLoading != this.state.isLoading ||
                nextState.filter != this.state.filter ||
                nextState.includeSubContext != this.state.includeSubContext ||
                nextState.selectedSearchContext != this.state.selectedSearchContext ||
                nextState.menuVisible != this.state.menuVisible ||
                nextState.statusComposerFocus != this.state.statusComposerFocus
    }
    headerClick = (e) => {
        const context = this.state.selectedSearchContext
        //NavigationUtilities.navigateToNewsfeed(this.props.history, context && context.type, context && context.id, this.state.includeSubContext)
    }
    menuItemClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const visible = !this.state.menuVisible
        const newState:Partial<State> = {menuVisible:visible}
        if(!visible && this.tempMenuData)
        {
            newState.selectedSearchContext = this.tempMenuData.selectedSearchContext
            newState.includeSubContext = this.tempMenuData.includeSubContext
            newState.filter = this.tempMenuData.filter
            const contextObject = this.tempMenuData.selectedSearchContext.contextObject(allowedSearchOptions)
            this.tempMenuData = null

            newState.contextObjectId = undefined
            newState.contextTitle = undefined
            newState.contextNaturalKey = contextObject && contextObject.contextNaturalKey

            if(contextObject)
            {
                console.log("selectedSearchContext", contextObject)
                if(contextObject.id && contextObject.id > 0)
                {
                    newState.contextNaturalKey = contextObject.contextNaturalKey
                    newState.contextObjectId = contextObject.id
                    newState.contextTitle = contextObject.value
                }
                else {
                    //resolve if contextObject is incomplete
                    const term = contextObject.value.isNumber() ? "django_id:" + contextObject.value : "slug:"+ contextObject.value.trimLeftCharacters("@")
                    ApiClient.search(1, 0, term, [ContextNaturalKey.elasticTypeForKey(contextObject.contextNaturalKey)],false, true,false,true,{}, [], (data, status, error) => {
                        let resolvedData:ContextValue = null
                        if(data && data.results && data.results.length > 0)
                        {
                            resolvedData = convertElasticResultItem( data.results[0] )
                        }
                        this.setState({contextNaturalKey:contextObject.contextNaturalKey, contextObjectId:resolvedData && resolvedData.id, contextTitle:resolvedData && resolvedData.label, contextResolveError:!resolvedData ? error || "Error": undefined})
                        ToastManager.showErrorToast(error)
                    })
                }
            }
        }
        this.setState(newState as State)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    renderLoading = () => {
        if (this.state.isLoading || this.props.isResolvingContext) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>)
        }
    }
    menuDataUpdated = (data:NewsfeedMenuData) => {
        this.tempMenuData = data
    }
    filterButtonChanged = (filter:ObjectAttributeType) => (event) => {

        const currentFilter = this.state.filter
        const newFilter = filter == currentFilter ? null : filter
        this.setState({filter:newFilter})
    }
    onAddStatusActionPress = (action: StatusActions, extra?: any, completion?: (success: boolean) => void) => {
        console.log("onAddStatusActionPress", action, extra)
        this.blurStatusComposer()
        const instance = this.newsfeedComponent.wrappedInstance as NewsfeedComponent
        if(instance)
            instance.createNewStatus(extra.message, extra.mentions, extra.files, completion )
    }
    blurStatusComposer = () => {
        this.setState({statusComposerFocus:false})
    }
    onStatusComposerFocus = (e: React.SyntheticEvent<{}>) => {
        this.setState({statusComposerFocus:true})
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, className, contextNaturalKey, contextObjectId, contextObject, includeSubContext, isResolvingContext, ...rest} = this.props
        const cn = classnames("newsfeed-module", className, {"menu-visible":this.state.menuVisible, "status-composer-focus":this.state.statusComposerFocus})
        const headerClick = breakpoint < ResponsiveBreakpoint.standard ? this.headerClick : undefined
        const {contextTitle}  = this.state
        const resolvedContextNaturalKey = this.state.contextNaturalKey || this.props.contextNaturalKey
        const resolvedContextObjectId =  this.state.contextObjectId || this.props.contextObjectId
        const title = contextTitle ? contextTitle + " - " + translate("Feed") : translate("Newsfeed")
        const headerClass = classnames({link:headerClick})
        const filter = this.state.filter
        const r = {wrappedComponentRef:(c) => this.newsfeedComponent = c}
        const canPost = (contextObject && contextObject.permission >= Permission.post) || false
        return (<Module {...rest} className={cn}>
                    <ModuleHeader title={title} loading={this.state.isLoading} className={headerClass} onClick={headerClick}>
                        {!this.state.menuVisible &&
                            <ButtonGroup>
                                {this.availableFilters.map(f => {
                                    return (<Button size="xs" key={f} active={filter == f} onClick={this.filterButtonChanged(f)} color="light">
                                                <i className={ObjectAttributeType.iconForType(f)}></i>
                                            </Button>)
                                })}
                            </ButtonGroup>
                        }
                        <ModuleMenuTrigger onClick={this.menuItemClick} />
                    </ModuleHeader>
                    {breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <>
                            <ModuleContent>
                            {canPost &&
                                <>
                                <div className="status-composer-backdrop" onMouseDown={this.blurStatusComposer}></div>
                                <div ref={this.statuscomposer} className="feed-composer-container main-content-background">
                                    <StatusComposerComponent
                                        canUpload={true}
                                        canMention={true}
                                        canComment={true}
                                        onActionPress={this.onAddStatusActionPress}
                                        contextNaturalKey={resolvedContextNaturalKey}
                                        contextObjectId={resolvedContextObjectId}
                                        placeholder={translate("newsfeed.module.addstatus.placeholder")}
                                        communityId={-1}
                                        renderPlaceholder={false}
                                        onFocus={this.onStatusComposerFocus}
                                        showEmojiPicker={this.state.statusComposerFocus}
                                        showSubmitButton={this.state.statusComposerFocus}
                                        //taggableMembers={task.visibility}
                                    />
                                </div></>}
                                <NewsfeedComponentRouted {...r}
                                    onLoadingStateChanged={this.feedLoadingStateChanged}
                                    includeSubContext={this.state.includeSubContext}
                                    contextNaturalKey={resolvedContextNaturalKey}
                                    contextObjectId={resolvedContextObjectId}
                                    isResolvingContext={this.props.isResolvingContext}
                                    filter={this.state.filter}
                                    />
                            </ModuleContent>
                            <ModuleFooter>NewsFeed Footer</ModuleFooter>
                        </>
                    }
                    <ModuleMenu visible={this.state.menuVisible}>
                        <NewsfeedMenu
                            onUpdate={this.menuDataUpdated}
                            selectedSearchContext={this.state.selectedSearchContext}
                            includeSubContext={this.state.includeSubContext}
                            filter={this.state.filter}
                            availableFilters={this.availableFilters}
                            />
                    </ModuleMenu>
                </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {

    const resolveContext = state.resolvedContext
    const resolvedContext = resolveContextObject(resolveContext, ownProps.contextNaturalKey)
    const isResolvingContext = resolvedContext && (!resolvedContext.contextObjectId && !resolvedContext.resolved)
    const contextObjectId = resolvedContext && resolvedContext.contextObjectId
    const contextObject = resolvedContext && getContextObject(resolvedContext.contextNaturalKey, resolvedContext.contextObjectId)
    return {
        contextObject,
        contextObjectId,
        isResolvingContext
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(NewsfeedModule))