import Conversations from './Conversations';
import { Conversation, Message, UploadedFile } from '../../reducers/conversations';
import * as React from 'react';
import { connect } from 'react-redux'
import { RootState } from '../../reducers/index';
import { ChatMessageList } from '../../components/general/ChatMessageList';
import { UserProfile } from '../../reducers/profileStore';
import { ChatMessageComposer } from '../../components/general/ChatMessageComposer';
import { addSocketEventListener, SocketMessageType, removeSocketEventListener } from '../../components/general/ChannelEventStream';
import { Settings } from '../../utilities/Settings';
import { TypingIndicator } from '../../components/general/TypingIndicator';
import { Avatar } from '../../components/general/Avatar';
import { cloneDictKeys, nullOrUndefined, appendTokenToUrl } from '../../utilities/Utilities';
import * as Actions from '../../actions/Actions'; 
import { FullPageComponent } from '../../components/general/FullPageComponent';
import { getConversationTitle } from '../../utilities/ConversationUtilities';
import { getProfileById } from '../../main/App';
import { getDefaultCachePage } from '../../reducers/createPaginator';
import { PaginationUtilities } from '../../utilities/PaginationUtilities';
import { QueueUtilities } from '../../utilities/QueueUtilities';
import { messageReducerPageSize } from '../../reducers/messages';
import { Mention } from '../../components/input/MentionEditor';
import { ConversationManager } from '../../main/managers/ConversationManager';

require("./ConversationView.scss");
export interface Props {
    match:any,
    conversation:Conversation,
    profile:UserProfile,
    requestNextMessagePage:(conversation:number, offset:number) => void
    isFetching:boolean,
    total:number,
    offset:number,
    items:Message[],
    conversationId:number,
    error:string,
    queuedMessages:Message[],
    last_fetched:number,
    mentions:Mention[],
    
}
export interface State {
    isTyping:object
    loading:boolean
    fullScreen:boolean
}

class ConversationView extends React.Component<Props, {}> {
    static maxRetries = 3
    clearSomeoneIsTypingTimer:NodeJS.Timer = null
    state:State
    constructor(props) {
        super(props)
        this.state = {
            isTyping:{},
            loading:false,
            fullScreen:false,
        }
        this.loadFirstData = this.loadFirstData.bind(this)
        this.loadNextPageData = this.loadNextPageData.bind(this) 
        this.chatDidScrollToTop = this.chatDidScrollToTop.bind(this)
        this.onDidType = this.onDidType.bind(this)
        this.onChatMessageSubmit = this.onChatMessageSubmit.bind(this)
        this.isTypingHandler = this.isTypingHandler.bind(this)
        this.incomingMessageHandler = this.incomingMessageHandler.bind(this)
        this.removeUserFromIsTypingData = this.removeUserFromIsTypingData.bind(this)
        this.markConversationAsRead = this.markConversationAsRead.bind(this)
        this.filesAdded = this.filesAdded.bind(this)
        
    }
    componentDidMount()
    {
        addSocketEventListener(SocketMessageType.CONVERSATION_TYPING, this.isTypingHandler)
        addSocketEventListener(SocketMessageType.CONVERSATION_MESSAGE, this.incomingMessageHandler)
        ConversationManager.ensureConversationExists(this.props.conversationId, () => {})
    }
    incomingMessageHandler(event:CustomEvent)
    {
        let message = event.detail.data as Message
        let conversation = this.props.conversationId
        if(message.conversation == conversation)
        {
            let it = this.removeUserFromIsTypingData(message.user)
            ConversationManager.markConversationAsRead(conversation, () => {})
            this.setState({isTyping:it })
        }
    }
    isTypingHandler(event:CustomEvent)
    {
        let user = event.detail.data.user
        if(user == this.props.profile.id || event.detail.data.conversation != this.props.conversationId)
        {
            return
        }
        let st = this.state.isTyping
        let it = cloneDictKeys(st)
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
    removeUserFromIsTypingData(user:number)
    {
        let st = this.state.isTyping
        let it = cloneDictKeys(st)
        delete it[user]
        return it
    }
    calculatePageSize(elementMinHeight:number)
    {
        return Math.ceil( screen.height * 3 / elementMinHeight / 10) * 10
    }
    componentWillUnmount()
    {
        removeSocketEventListener(SocketMessageType.CONVERSATION_TYPING, this.isTypingHandler)
        removeSocketEventListener(SocketMessageType.CONVERSATION_MESSAGE, this.incomingMessageHandler)
    }
    componentWillMount()
    {
        this.loadFirstData(true)
        this.markConversationAsRead(true)
    }
    componentDidUpdate(prevProps:Props, prevState) 
    {
        let isNewConversation = this.props.conversationId != prevProps.conversationId
        this.loadFirstData(isNewConversation)
        this.markConversationAsRead(isNewConversation)
    }
    markConversationAsRead(isNewConversation:boolean)
    {
        if(isNewConversation && this.props.conversationId)
            ConversationManager.markConversationAsRead(this.props.conversationId, () => {})
    }
    isTypingDictEqual(a, b)
    {
        return JSON.stringify(Object.keys(a).sort()) === JSON.stringify(Object.keys(b).sort())
    }
    shouldComponentUpdate(nextProps:Props, nextState:State)
    {
        let currentConversation = this.props.conversation
        let nextConversation = nextProps.conversation
        if(nextState.fullScreen == this.state.fullScreen && nextProps.isFetching == this.props.isFetching && currentConversation && nextConversation && currentConversation.id == nextConversation.id && currentConversation.updated_at == nextConversation.updated_at && nextProps.items == this.props.items && 
            this.isTypingDictEqual(nextState.isTyping, this.state.isTyping))
            return false
        return true
    }
    loadFirstData(ignoreError = false)
    {
        let hasError = ignoreError ? false : !nullOrUndefined( this.props.error )
        if(this.props.isFetching || hasError)
        {
            return
        }
        let pageSize = messageReducerPageSize
        if(!this.props.last_fetched && (this.props.total == 0 || this.props.offset == 0 || this.props.offset <= pageSize) )
            this.props.requestNextMessagePage(this.props.conversationId, this.props.offset)
    }
    loadNextPageData()
    {
        if(this.props.total > this.props.offset && !this.props.isFetching && !this.props.error)
            this.props.requestNextMessagePage(this.props.conversationId, this.props.offset)
    }
    chatDidScrollToTop()
    {
        this.loadNextPageData()
    }
    onChatMessageSubmit(text:string, mentions:number[])
    {
        let conversation = this.props.conversation
        if(!conversation)
            return
        let tempId = `${conversation.id}_${this.props.profile.id}_${Date.now()}`
        let tempMessage = this.getChatMessagePreview(text, null, tempId, mentions, conversation)
        ConversationManager.sendMessage(tempMessage)
    }
    getChatMessagePreview(text:string,file:File, uid:string, mentions:number[], conversation:Conversation):Message {
        let now = Date.now()
        let ds = new Date().toUTCString()
        let tempFile = nullOrUndefined(file) ? null : {file,progress:0}
        return {
            id: now,
            uid:uid,
            pending:true,
            text: text,
            user: this.props.profile.id,
            created_at: ds,
            conversation:conversation.id,
            attachment:null,
            updated_at:ds,
            read_by:[],
            mentions:mentions,
            tempFile
        }
    }
    onDidType()
    {
        let conversation = this.props.conversation
        if(!conversation)
            return
        ConversationManager.sendTypingInConversation(conversation.id)
    }
    renderSomeoneIsTyping()
    {
        let keys = Object.keys(this.state.isTyping).map(n => parseInt(n))
        if(keys.length > 0)
        {
            return <li className="is-typing-container">
            {keys.map((id, index) => {
                let avatar = getProfileById(id).avatar
                return (<Avatar key={index} image={avatar} size={24}/>)

            })}
            <TypingIndicator />
            </li>
        }
        return null
    }
    resizeButtonClick = (e) => {
        this.setState({fullScreen:!this.state.fullScreen})
    }
    filesAdded(files:File[])
    {
        let conversation = this.props.conversation
        if(!conversation)
            return
        files.forEach(f => {
            
            let tempId = `${conversation.id}_${this.props.profile.id}_${Date.now()}`
            let tempMessage = this.getChatMessagePreview("", f, tempId, [], conversation)
            ConversationManager.sendMessage(tempMessage)
        })
    }
    render() {
        let me = this.props.profile
        let conversation = this.props.conversation
        if(!me || !conversation)
        {
            return null
        }
        let myId = me.id
        let messages = this.props.queuedMessages.concat(this.props.items)
        return(
            <FullPageComponent>
                <div className="d-none d-sm-block col-lg-4 col-md-4 col-sm-5">
                    <Conversations preventShowTyingInChatId={conversation.id} activeConversation={this.props.conversationId} />
                </div>
                <div className={"col-lg-8 col-md-8 col-sm-7 col-xs-12" + (this.state.fullScreen ? " full-screen" : "")}>
                    <div id="conversation-view" className="card full-height">
                        <div className="card-header grey d-flex align-items-center">
                            {conversation && <span className="text-truncate d-block flex-grow-1">{getConversationTitle(conversation, myId)}</span>}
                            <div className="flex-shrink-0">
                                <button className="btn flex-shrink-0" onClick={this.resizeButtonClick} ><i className="fas fa-expand"></i></button>
                            </div>
                        </div>
                        <div className="card-body full-height">
                            <ChatMessageList conversation={conversation.id} loading={this.props.isFetching} chatDidScrollToTop={this.chatDidScrollToTop} messages={messages} current_user={this.props.profile} >
                                {this.renderSomeoneIsTyping()}
                            </ChatMessageList>
                        </div>
                        <ChatMessageComposer filesAdded={this.filesAdded} mentions={this.props.mentions} onSubmit={this.onChatMessageSubmit} onDidType={this.onDidType} />
                    </div>
                </div>
               
              </FullPageComponent>
        );
    }
}
const mapStateToProps = (state:RootState, ownProps:Props) => {
    let id = ownProps.match.params.conversationid
    const pagination = state.messages.conversations[id] || getDefaultCachePage()
    const allItems = state.messages.items
    const isFetching = pagination.fetching
    const items = PaginationUtilities.getCurrentPageResults(allItems, pagination)
    const total = pagination.totalCount
    const error = pagination.error
    const offset = items.length
    const queuedMessages = QueueUtilities.getQueuedMessageForConversation(id, state.queue.chatMessages)
    const last_fetched = pagination.last_fetch
    const conversation = state.conversations.items[id]
    const mentions = conversation ? conversation.users.map(u => {
        let p = getProfileById(u)
        return p ? new Mention(
            p.first_name + " " + p.last_name,
            p.username,
            appendTokenToUrl(p.avatar),
            p.id
          ) : null
    }).filter(n => n != null) : []
    return {
        error,
        conversationId:id,
        isFetching,
        total,
        offset,
        items,
        conversation:conversation,
        profile:state.profile,
        signedIn:state.auth.signedIn,
        queuedMessages,
        last_fetched,
        mentions
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        requestNextMessagePage:(conversation:number, offset:number) => {
            dispatch(Actions.requestNextMessagePage(conversation.toString(), offset))
        },
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ConversationView);