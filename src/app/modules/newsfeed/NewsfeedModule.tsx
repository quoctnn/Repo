import * as React from 'react';
import { connect, DispatchProp } from 'react-redux'
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
import { ObjectAttributeType, ContextNaturalKey, StatusActions, Permission, Permissible, IdentifiableObject } from '../../types/intrasocial_types';
import { ContextSearchData } from '../../components/general/input/contextsearch/extensions';
import { translate } from '../../localization/AutoIntlProvider';
import { ReduxState } from '../../redux';
import { StatusComposerComponent } from '../../components/general/input/StatusComposerComponent';
import { DropDownMenu } from '../../components/general/DropDownMenu';
import { OverflowMenuItem, OverflowMenuItemType } from '../../components/general/OverflowMenu';
import { EventSubscription } from 'fbemitter';
import { NotificationCenter } from '../../utilities/NotificationCenter';
import { eventStreamNotificationPrefix, EventStreamMessageType } from '../../network/ChannelEventStream';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { uniqueId } from '../../utilities/Utilities';
import { ContextDataProps, withContextData } from '../../hoc/WithContextData';

type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
    contextObjectId:number
} & ContextDataProps & DispatchProp
type DefaultProps = {

    includeSubContext:boolean
}
interface ReduxStateProps
{
    contextObjectId:number
    contextObject:Permissible & IdentifiableObject
}
interface State
{
    menuVisible:boolean
    isLoading:boolean
    feedReloadContext:string
    selectedSearchContext:ContextSearchData
    includeSubContext:boolean
    filter:ObjectAttributeType

    contextNaturalKey:ContextNaturalKey,
    contextObjectId:number
    contextTitle?:string
    statusComposerFocus:boolean
}
type Props = ReduxStateProps & OwnProps & DefaultProps & RouteComponentProps<any>

class NewsfeedModule extends React.Component<Props, State> {
    private observers:EventSubscription[] = []
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
            feedReloadContext:uniqueId(),
            contextNaturalKey:undefined,
            contextObjectId:undefined,
            statusComposerFocus:false
        }
    }
    componentDidMount = () => {
        const websocketUpdate = NotificationCenter.addObserver(eventStreamNotificationPrefix + EventStreamMessageType.SOCKET_STATE_CHANGE, this.websocketConnect)
        this.observers.push(websocketUpdate)
    }
    componentWillUnmount = () => {
        this.tempMenuData = null
        this.availableFilters = null
        this.newsfeedComponent = null
        this.statuscomposer = null
        this.observers.forEach(o => o.remove())
        this.observers = null
    }
    componentDidUpdate = (prevProps:Props) => {
        //turn off loading spinner if feed is removed
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        return nextState.feedReloadContext != this.state.feedReloadContext ||
                nextProps.breakpoint != this.props.breakpoint ||
                nextProps.contextNaturalKey != this.props.contextNaturalKey ||
                nextProps.contextObjectId != this.props.contextObjectId ||
                nextProps.includeSubContext != this.props.includeSubContext ||
                //state
                nextState.contextNaturalKey != this.state.contextNaturalKey ||
                nextState.contextObjectId != this.state.contextObjectId ||
                nextState.isLoading != this.state.isLoading ||
                nextState.filter != this.state.filter ||
                nextState.includeSubContext != this.state.includeSubContext ||
                nextState.selectedSearchContext != this.state.selectedSearchContext ||
                nextState.menuVisible != this.state.menuVisible ||
                nextState.statusComposerFocus != this.state.statusComposerFocus
    }
    websocketConnect = (...args:any[]) => {
        if (args[0] == ReconnectingWebSocket.OPEN) {
            this.setState({feedReloadContext:uniqueId()})
        }
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

            newState.contextObjectId = contextObject && contextObject.id
            newState.contextNaturalKey = contextObject && contextObject.contextNaturalKey
            newState.contextTitle = contextObject && contextObject.value
        }
        this.setState(newState as State)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    renderLoading = () => {
        if (this.state.isLoading) {
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
        this.blurStatusComposer()
        const instance = this.newsfeedComponent as NewsfeedComponent
        if(instance)
            instance.createNewStatus(extra.message, extra.files, completion )
    }
    blurStatusComposer = () => {
        this.setState({statusComposerFocus:false})
    }
    onStatusComposerFocus = (e: React.SyntheticEvent<{}>) => {
        this.setState({statusComposerFocus:true})
    }
    renderStatusComposer = (resolvedContextNaturalKey:ContextNaturalKey, resolvedContextObjectId:number) => {

        const {contextObject, contextNaturalKey} = this.props
        const canPost = (contextObject && contextObject.permission >= Permission.post) || false
        let communityId = contextObject && ((contextObject as any).community || null)
        if(canPost)
        {
            const taggableMembers = ContextNaturalKey.getMembers(contextNaturalKey, contextObject)
            return (<>
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
                        communityId={communityId}
                        renderPlaceholder={false}
                        onFocus={this.onStatusComposerFocus}
                        showEmojiPicker={this.state.statusComposerFocus}
                        showSubmitButton={this.state.statusComposerFocus}
                        singleLine={!this.state.statusComposerFocus}
                        forceHideDropzone={!this.state.statusComposerFocus}
                        useAdaptiveFontSize={this.state.statusComposerFocus}
                        taggableMembers={taggableMembers}
                    />
                </div>
            </>)
        }
        return null
    }
    connectRef = (ref) => {
        this.newsfeedComponent = ref
    }
    renderHeaderFilter = () => {
        if(this.state.menuVisible)
            return null
        const ddi: OverflowMenuItem[] = this.availableFilters.map(s => {
            return {
                id:s,
                type:OverflowMenuItemType.option,
                onPress:this.filterButtonChanged(s),
                title:ObjectAttributeType.translatedText(s),
                iconClass:ObjectAttributeType.iconForType(s),
            }
        })
        ddi.unshift({
            id:"all",
            type:OverflowMenuItemType.option,
            onPress:this.filterButtonChanged(null),
            title:ObjectAttributeType.translatedText(null),
            iconClass:ObjectAttributeType.iconForType(null),
        })
        const title = ObjectAttributeType.translatedText(this.state.filter)
        return <DropDownMenu triggerIcon={ObjectAttributeType.iconForType(this.state.filter)} triggerTitle={title} triggerClass="fas fa-caret-down mx-1" items={ddi}></DropDownMenu>
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, className, contextNaturalKey, contextObjectId, contextObject, includeSubContext, contextData, dispatch, ...rest} = this.props
        const headerClick = breakpoint < ResponsiveBreakpoint.standard ? this.headerClick : undefined
        const {contextTitle} = this.state
        const resolvedContextNaturalKey = this.state.contextNaturalKey || this.props.contextNaturalKey
        const resolvedContextObjectId =  this.state.contextObjectId || this.props.contextObjectId
        const disableContextSearch = !!contextNaturalKey && !!contextObjectId
        const showComposer = !!this.props.contextNaturalKey && !!this.props.contextObjectId
        const composer = showComposer ? this.renderStatusComposer(resolvedContextNaturalKey, resolvedContextObjectId) : undefined
        const hasComposer = !!composer
        const cn = classnames("newsfeed-module", className, {"menu-visible":this.state.menuVisible, "status-composer-focus":this.state.statusComposerFocus, "has-status-composer":hasComposer })
        const headerClass = classnames({link:headerClick})
        const title = composer || contextTitle || translate("Newsfeed")
        return (<Module {...rest} className={cn}>
                    <ModuleHeader headerTitle={title} loading={this.state.isLoading} className={headerClass} onClick={headerClick}>
                        {this.renderHeaderFilter()}
                        <ModuleMenuTrigger onClick={this.menuItemClick} />
                    </ModuleHeader>
                    <ModuleContent>
                        <NewsfeedComponentRouted wrappedComponentRef={this.connectRef}
                            onLoadingStateChanged={this.feedLoadingStateChanged}
                            includeSubContext={this.state.includeSubContext}
                            contextNaturalKey={resolvedContextNaturalKey}
                            contextObjectId={resolvedContextObjectId}
                            contextObject={contextObject}
                            filter={this.state.filter}
                            feedReloadContext={this.state.feedReloadContext}
                            scrollParent={window}
                            />
                    </ModuleContent>
                    <ModuleFooter></ModuleFooter>
                    <ModuleMenu visible={this.state.menuVisible}>
                        <NewsfeedMenu
                            onUpdate={this.menuDataUpdated}
                            selectedSearchContext={this.state.selectedSearchContext}
                            includeSubContext={this.state.includeSubContext}
                            filter={this.state.filter}
                            availableFilters={this.availableFilters}
                            disableContextSearch={disableContextSearch}
                            />
                    </ModuleMenu>
                </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const resolved = ownProps.contextData.getContextObject(ownProps.contextNaturalKey)
    return {
        contextObject:resolved,
        contextObjectId:resolved && resolved.id,
    }
}
export default  withContextData(withRouter(connect<ReduxStateProps, void, OwnProps>(mapStateToProps)(NewsfeedModule)))