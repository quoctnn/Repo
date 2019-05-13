import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./ConversationModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import { ContextNaturalKey, Conversation, Message, UserProfile } from '../../types/intrasocial_types';
import ApiClient, { PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import SimpleModule from '../SimpleModule';
import { ContextManager } from '../../managers/ContextManager';
import { ChatMessageList } from './ChatMessageList';
import { Avatar } from '../../components/general/Avatar';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { ProfileManager } from '../../managers/ProfileManager';
import { TypingIndicator } from '../../components/general/TypingIndicator';
import { NotificationCenter } from '../../utilities/NotificationCenter';
import { EventStreamMessageType } from '../../network/ChannelEventStream';
import { EventSubscription } from 'fbemitter';
import { ConversationManager } from '../../managers/ConversationManager';
import { Settings } from '../../utilities/Settings';
import { ChatMessageComposer } from '../../components/general/input/ChatMessageComposer';
import { Mention } from '../../components/general/input/MentionEditor';
import { ConversationUtilities } from '../../utilities/ConversationUtilities';
import Select from 'react-select';
import { ProfileOptionComponent, ProfileSingleValueComponent, createProfileFilterOption, ProfileFilterOption } from '../tasks/ProjectProfileFilter';
import { ActionMeta } from 'react-select/lib/types';
import { NavigationUtilities } from '../../utilities/NavigationUtilities';
import SimpleDialog from '../../components/general/dialogs/SimpleDialog';
import { ConversationEditor } from './ConversationEditor';

const reducer = (accumulator, currentValue) => accumulator + currentValue;
const uidToNumber = (uid) => uid.split("_").map(n => parseInt(n)).reduce(reducer)
const messageToUid = (message:Message) => message.conversation + "_" + message.user + "_" + new Date(message.updated_at).getTime()

type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
}
type State = {
    items:Message[]
    isLoading: boolean
    isRefreshing: boolean
    hasMore:boolean
    requestId:number
    hasReceivedData:boolean
    hasError:boolean
    showSpinner:boolean
    isTyping:{[key:string]:NodeJS.Timer}
    renderDropZone:boolean
    conversationEditorDialogVisible:boolean
}
type ReduxStateProps = {
    conversation: Conversation
    authenticatedUser:UserProfile
    queuedMessages:Message[]
    createNewConversation:boolean
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class ConversationModule extends React.Component<Props, State> {  

    private dragCount:number = 0
    private dropTarget = React.createRef<ChatMessageList>();
    private canPublishDidType = true
    private observers:EventSubscription[] = []
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            isRefreshing:false,
            items:[],
            hasMore:true,
            requestId:0,
            hasReceivedData:false,
            hasError:false,
            showSpinner:false,
            isTyping:{},
            renderDropZone:false,
            conversationEditorDialogVisible:false
        }
    }
    shouldReloadList = (prevProps:Props) => {
        const oldConversation = prevProps.conversation
        const newConversation = this.props.conversation
        return (oldConversation && !newConversation) ||
                (!oldConversation && newConversation) || 
                (oldConversation && newConversation && oldConversation.id != newConversation.id)
    }
    componentDidMount = () => {
        const obs1 = NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_TYPING, this.isTypingHandler)
        this.observers.push(obs1)
        const obs2 = NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_MESSAGE, this.incomingMessageHandler)
        this.observers.push(obs2)
        if(this.props.conversation)
        {
            this.reload()
        }
    }
    componentWillUnmount = () =>
    {
        this.observers.forEach(o => o.remove())
    }
    componentDidUpdate = (prevProps:Props) => {
        if(this.shouldReloadList(prevProps))
        {
            this.reload()
        }
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({showSpinner:false})
        }
    }
    incomingMessageHandler = (...args:any[]) => 
    {
        if(!this.props.conversation)
            return
        let message = args[0] as Message
        let conversation = this.props.conversation.id
        if(message.conversation == conversation)
        {
            let it = this.removeUserFromIsTypingData(message.user)
            ConversationManager.markConversationAsRead(conversation, () => {})
            this.setState((prevState:State) => {
                const items = prevState.items
                items.push(message)
                return {isTyping:it, items }
            })
        }
    }
    isTypingHandler = (...args:any[]) => {

        let object = args[0]
        let user = object.user
        let conversation = object.conversation
        if(user == this.props.authenticatedUser.id || (this.props.conversation && (conversation != this.props.conversation.id)))
        {
            return 
        }
        let it = {...this.state.isTyping}
        let oldUserTimer = it[user]
        if(oldUserTimer)
        {
            clearTimeout(oldUserTimer)
        }
        it[user] = setTimeout(() => 
        {
            let it = this.removeUserFromIsTypingData(user)
            this.setState({isTyping:it})

        }, Settings.clearSomeoneIsTypingInterval)
        this.setState({isTyping:it})
    }
    removeUserFromIsTypingData = (user:number) => {
        let it = {...this.state.isTyping}
        delete it[user]
        return it
    }
    reload = () => {
        const showSpinner = this.props.breakpoint >= ResponsiveBreakpoint.standard
        this.setState(prevState => ({
            isRefreshing: true,
            isLoading: true,
            items:[],
            requestId:prevState.requestId + 1,
            hasReceivedData:false,
            showSpinner
        }), this.loadData)
    }
    headerClick = (e) => {
        //NavigationUtilities.navigateToNewsfeed(this.props.history, context && context.type, context && context.id, this.state.includeSubContext)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    renderLoading = () => {
        if (this.state.showSpinner) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>)
        }
    }
    loadData = () => 
    {

        const { items } = this.state
        const offset = items.length
        const requestId = this.state.requestId
        this.fetchMessages(offset, (data) => {
            if(data && data.results)
            {
                let newData = data.results
                if(requestId == this.state.requestId)
                {
                    const d = offset == 0 ?  newData :  [...items, ...newData]
                    this.setState({
                        items: d,
                        isRefreshing: false,
                        hasMore:data.next != null,
                        isLoading:false,
                        hasReceivedData:true,
                        hasError:false,
                    });
                }
            }
            else {
                this.setState({
                    items: [],
                    isRefreshing: false,
                    hasMore:false,
                    isLoading:false,
                    hasReceivedData:true,
                    hasError:true,
                });
            }
        })
    }
    fetchMessages = (offset:number, completion:(items:PaginationResult<Message>) => void ) => {

        if(!this.props.conversation || this.props.conversation.temporary)
        {
            completion({results:[], count:0, previous:null, next:null})
            return
        }
        const conversationId = this.props.conversation.id
        ApiClient.getConversationMessages(conversationId, 30, offset, (data, status, error) => {
            completion(data)
            ToastManager.showErrorToast(error)
        })
    }
    handleLoadMore = () => 
    {
        if(!this.state.hasMore || this.state.isLoading)
        {
            return
        }
        this.setState(prevState => ({
            isLoading: true,
            requestId:prevState.requestId + 1
        }), this.loadData)
    }
    chatDidScrollToTop = () => {
        this.handleLoadMore()
    }
    renderSomeoneIsTyping()
    {
        let keys = Object.keys(this.state.isTyping).map(n => parseInt(n))
        if(keys.length > 0)
        {
            return <li className="is-typing-container">
            {keys.map((id, index) => {
                let avatar = ProfileManager.getProfileById(id).avatar
                return (<Avatar key={index} image={avatar} size={24}/>)

            })}
            <TypingIndicator />
            </li>
        }
        return null
    }
    handleMentionSearch = (search:string, completion:(mentions:Mention[]) => void) => {
        if(!this.props.conversation)
        {
            completion([])
            return
        }
        console.log("searching", search)
        ProfileManager.searchProfilesInContext({search, taggableMembers:this.props.conversation.users, completion:(profiles) => {
            completion(profiles.map(u => Mention.fromUser(u)))
        }})
    }
    onDidType = (unprocessedText:string) => {
        let conversation = this.props.conversation
        if(!conversation || conversation.temporary)
            return
        if(this.canPublishDidType) 
        {
            console.log("sendDidType")
            ConversationManager.sendTypingInConversation(conversation.id)
            this.canPublishDidType = false
            setTimeout(() => {
                this.canPublishDidType = true
            }, Settings.sendSomeoneIsTypingthrottle)
        }
    }
    createConversationWithMessage = (tempConversation:Conversation, message:Message) => {
        ApiClient.createConversation(tempConversation.title, tempConversation.users, (newConversation, status, error) => {
            if(newConversation)
            {
                message.conversation = newConversation.id
                ConversationManager.sendMessage(message)
                ConversationManager.updateTemporaryConversation(null)
                NavigationUtilities.navigateToConversation(this.props.history, newConversation.id)
                ToastManager.showInfoToast(translate("conversation.created"))
            }
            if(error || status == "error")
            {
                ToastManager.showErrorToast(error || translate("Could not create conversation"))
                return
            }
        } )
    }
    onChatMessageSubmit = (text:string, mentions:number[]) => {
        let conversation = this.props.conversation
        if(!conversation)
            return
        let tempId = `${conversation.id}_${this.props.authenticatedUser.id}_${Date.now()}`
        const message = ConversationUtilities.getChatMessagePreview(this.props.authenticatedUser.id, text, null, tempId, mentions, conversation)
        if(conversation.temporary)
            this.createConversationWithMessage(conversation, message)
        else 
            ConversationManager.sendMessage(message)
    }
    filesAdded = (files:File[]) => {
        let conversation = this.props.conversation
        if(!conversation)
            return
        files.forEach(f => {
            
            let tempId = `${conversation.id}_${this.props.authenticatedUser.id}_${Date.now()}`
            const message = ConversationUtilities.getChatMessagePreview(this.props.authenticatedUser.id, "", f, tempId, [], conversation)
            ConversationManager.sendMessage(message)
        })
    }
    onDragOver = (event:React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        try 
        {
            event.dataTransfer.dropEffect = "copy"
        } 
        catch (err) { }
    }
    onDrop = (event:React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        let files = []
        if (event.dataTransfer.items) 
        {
            for (var i = 0; i < event.dataTransfer.items.length; i++) 
            {
                if (event.dataTransfer.items[i].kind === 'file') 
                {
                    var file = event.dataTransfer.items[i].getAsFile()
                    files.push(file)
                }
            }
        } 
        else 
        {
            for (var i = 0; i < event.dataTransfer.files.length; i++) 
            {
                let file = event.dataTransfer.files[i]
                files.push(file)
            }
        }
        this.removeDragData(event)
        this.dragCount = 0
        this.setState({renderDropZone:false})
        if(files.length > 0)
            this.filesAdded(files)
    }

    removeDragData = (event:React.DragEvent<HTMLDivElement>) => {
        if (event.dataTransfer.items) 
        {
            event.dataTransfer.items.clear()
        } 
        else 
        {
            event.dataTransfer.clearData()
        }
    }
    onDragLeave = (event:React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        this.dragCount -= 1
        if(this.dragCount == 0 && this.state.renderDropZone)
        {
            this.setState({renderDropZone:false})
        }
        console.log("onDragLeave", this.dragCount)
    }
    onDragEnter = (event:React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        console.log((event.target as any).classList)
        this.dragCount += 1
        if(this.dragCount > 0 && !this.state.renderDropZone)
        {
            this.setState({renderDropZone:true})
        }
        console.log("onDragEnter", this.dragCount)
    }
    renderNoConversation = () => {
        return <div>NO CONTENT</div>
    }
    sortMessages = (a:Message, b:Message):number => {
        return b.id - a.id
        return uidToNumber(b.uid || messageToUid(b)) - uidToNumber(a.uid || messageToUid(a))
    }
    renderContent = () => {

        const { conversation, authenticatedUser } = this.props
        const {items, isLoading} = this.state
        let messages = this.props.queuedMessages.concat(items).sort(this.sortMessages)
        const conversationId = conversation && conversation.id
        if(!conversationId)
        {
            return this.renderNoConversation()
        }
        const cl = classnames("list list-component-list vertical-scroll droptarget")
        const canSubmit = !this.props.conversation.temporary || this.props.conversation.users.length > 0
        return <div className="list-component message-list-container">
                        <ChatMessageList ref={this.dropTarget}
                            onDragOver={this.onDragOver} 
                            onDrop={this.onDrop} 
                            onDragLeave={this.onDragLeave} 
                            onDragEnter={this.onDragEnter}
                            className={cl} 
                            conversation={conversationId} 
                            loading={isLoading} 
                            chatDidScrollToTop={this.chatDidScrollToTop} 
                            messages={messages} 
                            current_user={authenticatedUser} >
                            {this.renderSomeoneIsTyping()}
                        </ChatMessageList>
                    <ChatMessageComposer 
                                className="secondary-text main-content-secondary-background" 
                                mentionSearch={this.handleMentionSearch} 
                                content={""} 
                                mentions={[]} 
                                submitOnEnter={true}
                                filesAdded={this.filesAdded} 
                                onSubmit={this.onChatMessageSubmit} 
                                onDidType={this.onDidType} 
                                canSubmit={canSubmit}
                            />
                    {this.state.renderDropZone && 
                        <div className="drop-zone">
                            <div className="drop-zone-content">{translate("conversation.module.drop.to.send.title")}</div>
                        </div>}
                </div>
    }
    onMemberSelectChange = (value: ProfileFilterOption[], action: ActionMeta) => {
        const temp = {...this.props.conversation}
        temp.users = value.map(v => v.id)
        ConversationManager.updateTemporaryConversation(temp)
    }
    renderMembersInput = () => {
        
        const availableMembers = ProfileManager.getProfiles(ProfileManager.getContactListIds(false))
        const currentMembers = ProfileManager.getProfiles(this.props.conversation && this.props.conversation.users || [])
        const availableOptions = availableMembers.map(createProfileFilterOption)
        const defaultValue = currentMembers.map(createProfileFilterOption)
        return <div className="member-select-container"><span className="to-label">{translate("To")+ ":"}</span><Select
            defaultValue={defaultValue}
            isMulti={true}
            name="members"
            options={availableOptions}
            className="member-select"
            classNamePrefix="select"
            isClearable={false}
            onChange={this.onMemberSelectChange}
            components={{ Option: ProfileOptionComponent, SingleValue:ProfileSingleValueComponent }}
            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            menuPortalTarget={document.body} 
            autoFocus={true}
            placeholder={translate("conversation.create.members.placeholder")}
        /></div>
    }
    renderConversationEditorTitle = () => {
        const conversation = this.props.conversation
        if(conversation)
        {
            return <div onClick={this.toggleConversationEditorDialog}>{ConversationUtilities.getConversationTitle(conversation)}</div>
        }
        return null
    }
    toggleConversationEditorDialog = () => {
        this.setState((prevState:State ) => {
            return {conversationEditorDialogVisible:!prevState.conversationEditorDialogVisible}
        })
    }
    renderConversationEditorDialog = () => {
        const visible = this.state.conversationEditorDialogVisible
        return <SimpleDialog didCancel={this.toggleConversationEditorDialog} visible={visible}>
                    <ConversationEditor />
                </SimpleDialog>
        
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, conversation, createNewConversation, authenticatedUser, queuedMessages, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("conversation-module", className, {temporary:conversation && conversation.temporary})
        const title = createNewConversation ? this.renderMembersInput() : this.renderConversationEditorTitle()
        return (<SimpleModule {...rest} 
                    className={cn} 
                    headerClick={this.headerClick} 
                    breakpoint={breakpoint} 
                    isLoading={this.state.isLoading} 
                    headerTitle={title}>
                {this.renderContent()}
                {this.renderConversationEditorDialog()}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const conversation = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.CONVERSATION) as Conversation || state.tempCache.conversation
    const authenticatedUser = AuthenticationManager.getAuthenticatedUser()
    const queuedMessages = (!!conversation && state.messageQueue.messages.filter(m => m.conversation == conversation.id)) || []
    const createNewConversation = ownProps.match.params.conversationId == "new"
    return {
        conversation,
        authenticatedUser,
        queuedMessages,
        createNewConversation,
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ConversationModule))