import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from "react-router-dom";
import classnames from "classnames"
import "./ConversationsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { ContextNaturalKey, Conversation, UserProfile, ConversationFilter } from '../../types/intrasocial_types';
import { connect, DispatchProp } from 'react-redux';
import { ReduxState } from '../../redux';
import SimpleModule from '../SimpleModule';
import { translate } from '../../localization/AutoIntlProvider';
import ListComponent from '../../components/general/ListComponent';
import {ApiClient, PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import ConversationListItem from './ConversationListItem';
import { TypingIndicator } from '../../components/general/TypingIndicator';
import { EventSubscription } from 'fbemitter';
import { NotificationCenter } from '../../utilities/NotificationCenter';
import { EventStreamMessageType } from '../../network/ChannelEventStream';
import { Settings } from '../../utilities/Settings';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { uniqueId } from '../../utilities/Utilities';
import { ContextManager } from '../../managers/ContextManager';
import { ConversationManager, ConversationManagerConversationRemovedEvent } from '../../managers/ConversationManager';
import Routes from '../../utilities/Routes';
import { ConversationAction } from './ConversationListItem';
import { NavigationUtilities } from '../../utilities/NavigationUtilities';
import ConfirmDialog from '../../components/general/dialogs/ConfirmDialog';
import { CommonModuleProps } from '../Module';
import { OverflowMenuItem, OverflowMenuItemType } from '../../components/general/OverflowMenu';
import { DropDownMenu } from '../../components/general/DropDownMenu';


export const ConversationActionDeleteNotification = "ConversationActionDeleteNotification"
export const ConversationActionArchiveNotification = "ConversationActionArchiveNotification"
export const ConversationActionLeaveNotification = "ConversationActionLeaveNotification"
export const ConversationActionRemoveUsersNotification = "ConversationActionRemoveUsersNotification"

export type ConversationActionArgument = {conversation:number, users?:number[], temporary?:boolean}
type IsTypingStore = {[conversation:number]:{[user:number]:NodeJS.Timer}}
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps & DispatchProp
type DefaultProps = {
    activeConversation:number
    preventShowTypingInChatId:number,
}
type State = {
    isLoading:boolean
    isTyping:IsTypingStore
    listRedrawContext?:string
    createConversationDialogVisible:boolean,
    conversationActionInProgress:{argument:ConversationActionArgument, action:ConversationAction}
    filter:ConversationFilter
}
type ReduxStateProps = {
    authenticatedUser:UserProfile
    conversation:Conversation
    createNewConversation:boolean
    tempConversation:Conversation
    routeConversationId:string
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps & DefaultProps
export const tempConversationId = "new"
class ConversationsModule extends React.Component<Props, State> {
    conversationsList = React.createRef<ListComponent<Conversation>>()
    private observers:EventSubscription[] = []
    static defaultProps:DefaultProps = {
        activeConversation:-1,
        preventShowTypingInChatId:-1
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            isTyping:{},
            createConversationDialogVisible:false,
            conversationActionInProgress:{argument:{conversation:0}, action:null},
            filter:null,
        }
        const observer = NotificationCenter.addObserver(ConversationManagerConversationRemovedEvent, this.processConversationRemoved)
        this.observers.push(observer)
        const observer1 = NotificationCenter.addObserver(ConversationActionArchiveNotification, this.processConversationActionArchive)
        this.observers.push(observer1)
        const observer2 = NotificationCenter.addObserver(ConversationActionLeaveNotification, this.processConversationActionLeave)
        this.observers.push(observer2)
        const observer3 = NotificationCenter.addObserver(ConversationActionRemoveUsersNotification, this.processConversationActionRemoveUsers)
        this.observers.push(observer3)
        const observer4 = NotificationCenter.addObserver(ConversationActionDeleteNotification, this.processConversationActionDelete)
        this.observers.push(observer4)

    }
    componentWillUnmount = () => {
        this.observers.forEach(o => o.remove())
        this.observers = null
        this.conversationsList = null
    }
    processConversationActionDelete = (...args:any[]) => {
        let data:ConversationActionArgument = args[0]
        this.onConversationAction(ConversationAction.delete, data)
    }
    processConversationActionRemoveUsers = (...args:any[]) => {
        let data:ConversationActionArgument = args[0]
        this.onConversationAction(ConversationAction.removeUsers, data)
    }
    processConversationActionLeave = (...args:any[]) => {
        let data:ConversationActionArgument = args[0]
        this.onConversationAction(ConversationAction.leave, data)
    }
    processConversationActionArchive = (...args:any[]) => {
        let data:ConversationActionArgument = args[0]
        this.onConversationAction(ConversationAction.archive, data)
    }
    processConversationRemoved = (...args:any[]) => {
        let data:ConversationActionArgument = args[0]
        const isActive = this.props.routeConversationId == data.conversation.toString()
        this.conversationsList.current.removeItemById(data.conversation)
        if(isActive && !data.temporary)
        {
            this.navigateToFirstConversation()
        }
    }
    componentDidMount = () => {
        const obs1 = NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_TYPING, this.isTypingHandler)
        this.observers.push(obs1)
        const obs2 = NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_NEW, this.processIncomingConversation)
        this.observers.push(obs2)
        const obs3 = NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_UPDATE, this.processIncomingConversation)
        this.observers.push(obs3)
        if(this.props.createNewConversation)
            this.createTemporaryConversation()
    }
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        if(this.state.filter != prevState.filter)
        {
            this.conversationsList.current.reload()
        }
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
        if(this.props.tempConversation)
        {
            this.conversationsList.current.safeUnshift(this.props.tempConversation)
        }
        if(!this.props.routeConversationId)
        {
            this.navigateToFirstConversation()
        }
    }
    processIncomingConversation = (...args:any[]) =>
    {
        let conversation = args[0] as Conversation
        this.conversationsList.current.safeUnshift(conversation)
        this.setState((prevState:State) => {
            return {listRedrawContext:uniqueId()}
        })
    }
    isTypingHandler = (...args:any[]) => {
        let object = args[0]
        let user = object.user
        let conversation = object.conversation
        if((this.props.preventShowTypingInChatId && this.props.preventShowTypingInChatId == conversation) || user == this.props.authenticatedUser.id || !this.conversationsList.current.getItemById(conversation))
        {
            return
        }
        let it = {...this.state.isTyping}
        let conversationData = it[conversation]
        if(conversationData)
        {
            clearTimeout(conversationData[user])
        }
        else
        {
            it[conversation] = {}
        }
        it[conversation][user] = setTimeout(() =>
            {
                let it = this.removeUserFromIsTypingData(conversation, user)
                this.setState({isTyping:it})

            }, Settings.clearSomeoneIsTypingInterval)
        this.setState({isTyping:it})
    }
    removeUserFromIsTypingData = (conversation:number, user:number) => {
        let it = {...this.state.isTyping}
        let conversationData = it[conversation]
        if(conversationData)
        {
            clearTimeout(conversationData[user])
            delete it[conversation][user]
            if(Object.keys(it[conversation]).length == 0)
            {
                delete it[conversation]
            }
        }
        return it
    }
    headerClick = (e) => {
        //NavigationUtilities.navigateToNewsfeed(this.props.history, context && context.type, context && context.id, this.state.includeSubContext)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    fetchConversations = (offset:number, completion:(items:PaginationResult<Conversation>) => void ) => {
        const archived = this.state.filter == ConversationFilter.archived
        ApiClient.getConversations( 30, offset, archived, null, (data, status, error) => {
            if(data && data.results)
            {
                ConversationManager.storeConversations(data.results)
            }
            completion(data)
            ToastManager.showErrorToast(error)
        })
    }
    renderSomeoneIsTyping = (conversationId:number) => {
        let isTypingData = this.state.isTyping && this.state.isTyping[conversationId]
        if(isTypingData)
        {
            return <div className="is-typing-container">
                        <TypingIndicator />
                    </div>
        }
        return null
    }
    resetAction = () => {
        this.setState(() => {
            return {conversationActionInProgress:{argument:{conversation:0}, action:null}}
        })
    }
    setAction = (argument:ConversationActionArgument, action:ConversationAction) => {
        this.setState(() => {
            return {conversationActionInProgress:{argument, action:action}}
        })
    }
    navigateToFirstConversation = () => {

        const conversation = this.conversationsList.current.getItemAtIndex(0)
        if(conversation)
        {
            const id = conversation.temporary ? tempConversationId : conversation.id
            NavigationUtilities.navigateToConversation(this.props.history, id)
        }
    }
    onConfirmAction = (confirmed:boolean) => {
        const action = this.state.conversationActionInProgress
        if(action.argument.conversation == 0)
            return
        if(action.action == ConversationAction.delete)
        {
            if(confirmed)
            {
                ConversationManager.deleteConversation(action.argument.conversation, (success) => {
                    if(success)
                    {
                        ToastManager.showInfoToast("conversation.deleted")
                        this.conversationsList.current.removeItemById(action.argument.conversation)
                        this.navigateToFirstConversation()
                    }
                    this.resetAction()
                })
            }
            else {
                this.resetAction()
            }
        }
        else if(action.action == ConversationAction.archive)
        {
            if(confirmed)
            {
                ConversationManager.archiveConversation(action.argument.conversation, (success) => {
                    if(success)
                    {
                        ToastManager.showInfoToast(translate("conversation.archived"))
                        this.conversationsList.current.removeItemById(action.argument.conversation)
                        this.navigateToFirstConversation()
                    }
                    this.resetAction()
                })
            }
            else {
                this.resetAction()
            }
        }
        else if(action.action == ConversationAction.leave)
        {
            if(confirmed)
            {
                ConversationManager.leaveConversation(action.argument.conversation, (success) => {
                    if(success)
                    {
                        ToastManager.showInfoToast(translate("You left the conversation!"))
                    }
                    this.resetAction()
                })
            }
            else {
                this.resetAction()
            }
        }
        else if(action.action == ConversationAction.removeUsers)
        {
            if(confirmed)
            {
                ConversationManager.removeUsersFromConversation(action.argument.conversation, action.argument.users, (success) => {
                    if(success)
                    {
                        ToastManager.showInfoToast(translate("User(s) removed from conversation!"))
                    }
                    this.resetAction()
                })
            }
            else {
                this.resetAction()
            }
        }
    }
    renderConfirmDialog = () => {
        const action = this.state.conversationActionInProgress
        const visible = action.action && action.argument.conversation > 0
        const title = action.action ? translate(`conversation.prevent${action.action}.title`) : ""
        const message = action.action ? translate(`conversation.prevent${action.action}.description`) : ""
        const okButtonTitle = translate("common.yes")
        return <ConfirmDialog visible={visible} title={title} message={message} didComplete={this.onConfirmAction} okButtonTitle={okButtonTitle}/>
    }
    onConversationAction = (action:ConversationAction, argument:ConversationActionArgument) => {

        const currentAction = this.state.conversationActionInProgress
        const currentActionInProgress = currentAction.argument.conversation > 0
        if(currentActionInProgress)
            return
        switch(action)
        {
            case ConversationAction.delete:
            {
                const conversation = this.conversationsList.current.getItemById(argument.conversation)
                if(conversation.temporary)
                {
                    const firstConversation = this.conversationsList.current.getItemAtIndex(1)
                    ConversationManager.updateTemporaryConversation(null)
                    this.conversationsList.current.removeItemById(conversation.id)
                    NavigationUtilities.navigateToConversation(this.props.history, firstConversation && firstConversation.id)
                    break;
                }
            }
            case ConversationAction.leave:
            case ConversationAction.archive:
            case ConversationAction.removeUsers:
            {
                this.setAction(argument, action)
                break;
            }
        }
    }
    isConversationActive = (conversationId:number) => {
        return (this.props.createNewConversation && this.props.tempConversation && (this.props.tempConversation.id == conversationId)) ||
        (this.props.conversation && (this.props.conversation.id == conversationId))
    }
    renderConversation = (conversation:Conversation) =>  {
        const isActive = this.isConversationActive(conversation.id)
        return <ConversationListItem onConversationAction={this.onConversationAction} key={conversation.id} conversation={conversation} isActive={isActive} >
                {this.renderSomeoneIsTyping(conversation.id)}
                </ConversationListItem>
    }
    renderEmpty = () => {
        return <div>{"Empty List"}</div>
    }
    sortItems = (conversations:Conversation[]) => {
        const sorted = conversations.sort((a, b) =>  new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        return sorted
    }
    listOffsetCountFilter = (items:Conversation[]) => {
        return items.filter(i => !i.temporary).length
    }
    onDidLoadData = (offset:number) => {
        if(offset == 0 && this.props.activeConversation == null)
        {
            this.navigateToFirstConversation()
        }
    }
    renderContent = () => {

        const {} = this.props
        return <>
            <ListComponent<Conversation>
                        ref={this.conversationsList}
                        onDidLoadData={this.onDidLoadData}
                        offsetCountFilter={this.listOffsetCountFilter}
                        renderEmpty={this.renderEmpty}
                        onLoadingStateChanged={this.feedLoadingStateChanged}
                        fetchData={this.fetchConversations}
                        sortItems={this.sortItems}
                        redrawContext={this.state.listRedrawContext}
                        renderItem={this.renderConversation} className="conversations-module-list" />
            </>
    }
    showCreateConversationDialog = () => {
        this.setState((prevState) => {
            return {createConversationDialogVisible:true}
        })
    }
    closeCreateConversationDialog = () => {
        this.setState((prevState) => {
            return {createConversationDialogVisible:false}
        })
    }
    createTemporaryConversation = () => {

        if(!this.props.tempConversation)
        {
            const onReady = () => {

                ConversationManager.createTemporaryConversation(this.props.authenticatedUser.id)
                this.conversationsList.current && this.conversationsList.current.scrollToTop()
            }
            if(this.state.filter == ConversationFilter.archived)
            {
                this.setState(() => {
                    return {filter:null}
                },onReady)
            }
            else {
                onReady()
            }
        }
    }
    renderHeaderContent = () => {
        return <div className="flex-shrink-0 d-flex">
                    {this.renderFilters()}
                    <Link title={translate("conversation.menu.create")} onClick={this.createTemporaryConversation} to={Routes.conversationUrl(tempConversationId)} className="btn btn-dark flex-shrink-0 btn-xs" >
                        <i className="fas fa-plus"></i>
                    </Link>
                </div>
    }
    applyFilter = (filter:ConversationFilter) => (e) => {
        this.setState((prevState:State ) => {
            return {filter:filter}
        })
    }
    renderFilters = () => {
        const ddi: OverflowMenuItem[] = ConversationFilter.all.map(s => {
            return {
                id:s,
                type:OverflowMenuItemType.option,
                onPress:this.applyFilter(s),
                title:ConversationFilter.translatedText(s),
                iconClass:ConversationFilter.icon(s),
            }
        })
        ddi.unshift({
            id:"all",
            type:OverflowMenuItemType.option,
            onPress:this.applyFilter(null),
            title:ConversationFilter.translatedText(null),
            iconClass:ConversationFilter.icon(null),
        })
        const title = ConversationFilter.translatedText(this.state.filter)
        return <DropDownMenu triggerIcon={ConversationFilter.icon(this.state.filter)} triggerTitle={title} triggerClass="fas fa-caret-down mx-1" items={ddi}></DropDownMenu>
    }
    render()
    {
        const { history,
            match,
            location,
            staticContext,
            contextNaturalKey,
            authenticatedUser,
            preventShowTypingInChatId,
            activeConversation,
            conversation,
            createNewConversation,
            tempConversation,
            routeConversationId,
            dispatch,
            ...rest} = this.props

        const {breakpoint, className} = this.props
        const cn = classnames("conversations-module", className)
        return (<SimpleModule {...rest}
                    className={cn}
                    headerClick={this.headerClick}
                    breakpoint={breakpoint}
                    isLoading={this.state.isLoading}
                    headerTitle={translate("conversations.module.title")}
                    headerContent={this.renderHeaderContent()}
                    >
                {this.renderContent()}
                {this.renderConfirmDialog()}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const authenticatedUser = AuthenticationManager.getAuthenticatedUser()
    const conversation = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.CONVERSATION) as Conversation
    const conversationId:string = ownProps.match.params.conversationId
    const createNewConversation = conversationId == tempConversationId
    const tempConversation = state.tempCache.conversation
    return {
        authenticatedUser,
        conversation,
        createNewConversation,
        tempConversation,
        routeConversationId: conversationId
    }
}
const mergeProps = (stateProps, dispatchProps, ownProps) => 
{ 
    return {...ownProps, ...stateProps}
}
export default withRouter(connect(mapStateToProps, undefined)(ConversationsModule))