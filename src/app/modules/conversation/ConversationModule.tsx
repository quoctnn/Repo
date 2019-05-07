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
}
type ReduxStateProps = {
    conversation: Conversation
    authenticatedUser:UserProfile
    queuedMessages:Message[]
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class ConversationModule extends React.Component<Props, State> {  

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
            isTyping:{}
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
        if(user == this.props.authenticatedUser.id || conversation != this.props.conversation.id)
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
        const conversationId = this.props.conversation && this.props.conversation.id
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
        if(!conversation)
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
    onChatMessageSubmit = (text:string, mentions:number[]) => {
        let conversation = this.props.conversation
        if(!conversation)
            return
        let tempId = `${conversation.id}_${this.props.authenticatedUser.id}_${Date.now()}`
        const message = ConversationUtilities.getChatMessagePreview(this.props.authenticatedUser.id, text, null, tempId, mentions, conversation)
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
    renderNoConversation = () => {
        return <div>NO CONTENT</div>
    }
    renderContent = () => {

        const { conversation, authenticatedUser } = this.props
        const {items, isLoading} = this.state
        let messages = this.props.queuedMessages.concat(items).sort((a,b) => uidToNumber(b.uid || messageToUid(b)) - uidToNumber(a.uid || messageToUid(a)))
        const conversationId = conversation && conversation.id
        return <div className="list-component message-list-container">
                    <ChatMessageList className="list list-component-list vertical-scroll" conversation={conversationId} loading={isLoading} chatDidScrollToTop={this.chatDidScrollToTop} messages={messages} current_user={authenticatedUser} >
                        {this.renderSomeoneIsTyping()}
                        {!conversationId && this.renderNoConversation()}
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
                            />
                </div>
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, conversation, authenticatedUser, queuedMessages, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("conversation-module", className)
        return (<SimpleModule {...rest} 
                    className={cn} 
                    headerClick={this.headerClick} 
                    breakpoint={breakpoint} 
                    isLoading={this.state.isLoading} 
                    headerTitle={translate("conversation.module.title")}>
                {this.renderContent()}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const conversation = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.CONVERSATION) as Conversation
    const authenticatedUser = AuthenticationManager.getAuthenticatedUser()
    const queuedMessages = (!!conversation && state.messageQueue.messages.filter(m => m.conversation == conversation.id)) || []
    return {
        conversation,
        authenticatedUser,
        queuedMessages
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ConversationModule))