import Conversations from './Conversations';
import { Conversation, Message } from '../../reducers/conversationStore';
import * as React from 'react';
import { connect } from 'react-redux'
import { RootReducer } from '../../reducers/index';
import { ChatMessageList } from '../../components/general/ChatMessageList';
import { UserProfile } from '../../reducers/profileStore';
import { toast } from 'react-toastify';
import { ErrorToast } from '../../components/general/Toast';
import { ChatMessageComposer } from '../../components/general/ChatMessageComposer';
import { sendTypingInConversation, addSocketEventListener, SocketMessageType, removeSocketEventListener, sendMessageToConversation } from '../../components/general/ChannelEventStream';
import { Settings } from '../../utilities/Settings';
import { TypingIndicator } from '../../components/general/TypingIndicator';
import { Avatar } from '../../components/general/Avatar';
import { cloneDictKeys } from '../../utilities/Utilities';
import * as Actions from '../../actions/Actions'; 
import { FullPageComponent } from '../../components/general/FullPageComponent';
import { getConversationTitle } from '../../utilities/ConversationUtilities';
import { getProfileById } from '../../main/App';
import { defaultPage } from '../../reducers/createPaginator';
import { PaginationUtilities } from '../../utilities/PaginationUtilities';

require("./ConversationView.scss");
export interface Props {
    match:any,
    conversation:Conversation,
    profile:UserProfile,
    queueAddChatMessage:(message:Message) => void,
    requestNextMessagePage:(conversation:number, offset:number) => void
    isFetching:boolean,
    total:number,
    offset:number,
    items:Message[],
    conversationId:number,
    error:string
}
export interface State {
    isTyping:object,
    loading:boolean,
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
        }
        this.loadFirstData = this.loadFirstData.bind(this)
        this.loadNextPageData = this.loadNextPageData.bind(this) 
        this.onMessagesReceived = this.onMessagesReceived.bind(this)
        this.chatDidScrollToTop = this.chatDidScrollToTop.bind(this)
        this.onDidType = this.onDidType.bind(this)
        this.onChatMessageSubmit = this.onChatMessageSubmit.bind(this)
        this.isTypingHandler = this.isTypingHandler.bind(this)
        this.incomingMessageHandler = this.incomingMessageHandler.bind(this)
        this.removeUserFromIsTypingData = this.removeUserFromIsTypingData.bind(this)
        this.appendMessage = this.appendMessage.bind(this)
    }
    componentDidMount()
    {
        addSocketEventListener(SocketMessageType.CONVERSATION_TYPING, this.isTypingHandler)
        addSocketEventListener(SocketMessageType.CONVERSATION_MESSAGE, this.incomingMessageHandler)
    }
    incomingMessageHandler(event:CustomEvent)
    {
        let message = event.detail as Message
        let conversation = this.props.conversation
        if(!conversation || conversation.id != message.conversation)
        {
            return
        }

        let uid = message.uid
        var replaced = false
        let messages = this.props.items.map(m => {
            if(m.uid && m.uid == uid && m.pending)
            {
                replaced = true
                return message
            }
            return m
        })
        if(!replaced)
            messages.unshift(message)

        let it = this.removeUserFromIsTypingData(message.user)
        let increment =  replaced ? 0 : 1
        this.setState({data:messages, total:this.props.total + increment, offset:this.props.offset + increment, isTyping:it })
    }
    isTypingHandler(event:CustomEvent)
    {
        let user = event.detail.user  
        if(user == this.props.profile.id)
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
    }
    componentDidUpdate(prevProps:Props, prevState)
    {
        this.loadFirstData(this.props.conversationId != prevProps.conversationId)
    }
    isTypingDictEqual(a, b)
    {
        return JSON.stringify(Object.keys(a).sort()) === JSON.stringify(Object.keys(b).sort())
    }
    shouldComponentUpdate(nextProps:Props, nextState:State)
    {
        let currentConversation = this.props.conversation
        let nextConversation = nextProps.conversation
        if(nextProps.isFetching == this.props.isFetching && currentConversation && nextConversation && currentConversation.id == nextConversation.id && currentConversation.updated_at == nextConversation.updated_at && nextProps.items == this.props.items && 
            this.isTypingDictEqual(nextState.isTyping, this.state.isTyping))
            return false
        return true
    }
    onMessagesReceived(data, status:string, error:string)
    {
        if(error || status == "error" || !data.results)
        {
            toast.error(<ErrorToast message={error || "Error retrieving messages"} />, { hideProgressBar: true })
            this.setState({loading:false})
            return
        }
        let newData = data.results || []
        let oldData = this.props.items.concat(newData)
        this.setState({data:oldData, loading:false, total:data.count, offset:oldData.length })
    }
    loadFirstData(ignoreError = false)
    {
        let hasError = ignoreError ? false : this.props.error
        if((this.props.total == 0 || this.props.offset == 0) && !this.props.isFetching && !hasError)
            this.props.requestNextMessagePage(this.props.conversationId, 0)
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
    onChatMessageSubmit(text:string)
    {
        let conversation = this.props.conversation
        if(!conversation)
            return
        let tempId = `${conversation.id}_${this.props.profile.id}_${Date.now()}`
        let tempMessage = this.getChatMessagePreview(text, tempId, conversation)
        this.appendMessage(tempMessage)
        this.props.queueAddChatMessage(tempMessage)
        sendMessageToConversation(conversation.id, text,tempId)
    }
    appendMessage(message:Message)
    {
        let messages = this.props.items.map(m => m)
        messages.unshift(message)
        this.setState({data:messages, total:this.props.total + 1, offset:this.props.offset + 1})
    }
    getChatMessagePreview(text:string, uid:string, conversation:Conversation):Message {
        let now = Date.now()
        let ds = new Date().toUTCString()
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
        }
    }
    onDidType()
    {
        let conversation = this.props.conversation
        if(!conversation)
            return
        sendTypingInConversation(conversation.id)
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
    render() {
        let me = this.props.profile
        let conversation = this.props.conversation
        if(!me || !conversation)
        {
            return null
        }
        let myId = me.id
        let messages = this.props.items
        return(
            <FullPageComponent>
                <div className="d-none d-sm-block col-lg-4 col-md-4 col-sm-5">
                    <Conversations />
                </div>
                <div className="col-lg-8 col-md-8 col-sm-7 col-xs-12">
                    <div id="conversation-view" className="full-height">
                        {conversation && <h3><span className="text-truncate d-block">{getConversationTitle(conversation, myId)}</span></h3>}
                            <ChatMessageList conversation={conversation.id} loading={this.props.isFetching} chatDidScrollToTop={this.chatDidScrollToTop} messages={messages} current_user={this.props.profile} >
                                {this.renderSomeoneIsTyping()}
                            </ChatMessageList>
                        <ChatMessageComposer onSubmit={this.onChatMessageSubmit} onDidType={this.onDidType} />
                    </div>
                </div>
               
              </FullPageComponent>
        );
    }
}
const mapStateToProps = (state:RootReducer, ownProps:Props) => {
    let id = ownProps.match.params.conversationid
    const pagination = state.messages.conversations[id] || defaultPage
    const allItems = state.messages.items
    const isFetching = pagination.fetching
    const items = PaginationUtilities.getCurrentPageResults(allItems, pagination)
    const total = pagination.totalCount
    const error = pagination.error
    const offset = items.length
    return {
        error,
        conversationId:id,
        isFetching,
        total,
        offset,
        items,
        conversation:state.conversations.items[id],
        profile:state.profile,
        signedIn:state.auth.signedIn,
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        queueAddChatMessage:(message:Message) => {
            dispatch(Actions.queueAddChatMessage(message))
        },
        requestNextMessagePage:(conversation:number, offset:number) => {
            dispatch(Actions.requestNextMessagePage(conversation.toString(), offset))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ConversationView);