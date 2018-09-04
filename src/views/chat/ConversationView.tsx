import Conversations from './Conversations';
import { Conversation, Message } from '../../reducers/conversationStore';
import * as React from 'react';
import { connect } from 'react-redux'
import { RootReducer } from '../../reducers/index';
import { ChatMessageList } from '../../components/general/ChatMessageList';
import { UserProfile } from '../../reducers/profileStore';
import ApiClient from '../../network/ApiClient';
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

require("./ConversationView.scss");
export interface Props {
    match:any,
    conversations:Conversation[],
    profile:UserProfile,
    queueAddChatMessage:(message:Message) => void,
}
export interface State {
    data:Message[],
    loading:boolean,
    offset:number,
    pageSize:number,
    total:number,
    isTyping:object,
}

class ConversationView extends React.Component<Props, {}> {

    clearSomeoneIsTypingTimer:NodeJS.Timer = null
    state:State
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            offset:0,
            loading: true,
            total:0,
            pageSize:this.calculatePageSize(100),
            isTyping:{}
        }
        this.onMessagesReceived = this.onMessagesReceived.bind(this)
        this.loadMessagesFromServer = this.loadMessagesFromServer.bind(this)
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
        this.loadMessagesFromServer()
        addSocketEventListener(SocketMessageType.CONVERSATION_TYPING, this.isTypingHandler)
        addSocketEventListener(SocketMessageType.CONVERSATION_MESSAGE, this.incomingMessageHandler)
    }
    incomingMessageHandler(event:CustomEvent)
    {
        let message = event.detail as Message
        let conversation = this.getConversation()
        if(conversation.id != message.conversation)
        {
            return
        }

        let uid = message.uid
        var replaced = false
        let messages = this.state.data.map(m => {
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
        this.setState({data:messages, total:this.state.total + increment, offset:this.state.offset + increment, isTyping:it })
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
    componentWillUpdate(nextProps:Props, nextState)
    {
        let currentConversation = this.getConversation()
        let nextConversation = this.getConversation(nextProps)
        if(currentConversation.id != nextConversation.id)
        {
            this.setState({ data:[], offset:0, total:0, loading:true}, this.loadMessagesFromServer)
        }
    }
    componentWillUnmount()
    {
        removeSocketEventListener(SocketMessageType.CONVERSATION_TYPING, this.isTypingHandler)
        removeSocketEventListener(SocketMessageType.CONVERSATION_MESSAGE, this.incomingMessageHandler)
    }
    componentWillMount()
    {
    }
    isTypingDictEqual(a, b)
    {
        return JSON.stringify(Object.keys(a).sort()) === JSON.stringify(Object.keys(b).sort())
    }
    shouldComponentUpdate(nextProps:Props, nextState:State)
    {
        let currentConversation = this.getConversation()
        let nextConversation = this.getConversation(nextProps)
        if(nextState.loading == this.state.loading && currentConversation && nextConversation && currentConversation.id == nextConversation.id && currentConversation.updated_at == nextConversation.updated_at && nextState.data == this.state.data && 
            this.isTypingDictEqual(nextState.isTyping, this.state.isTyping))
            return false
        return true
    }
    getConversation(props?:Props)
    {
        let p = props || this.props
        let id = parseInt(p.match.params.conversationid)
        if(p.conversations)
            return p.conversations.find(e => e.id == id)
        return null
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
        let oldData = this.state.data.concat(newData)
        this.setState({data:oldData, loading:false, total:data.count, offset:oldData.length })
    }
    loadMessagesFromServer()
    {
        let conversation = this.getConversation()
        ApiClient.getConversationMessages(conversation.id,this.state.pageSize,  this.state.offset, this.onMessagesReceived )
    }
    chatDidScrollToTop()
    {
        if(this.state.total > this.state.data.length && !this.state.loading)
        {
            this.setState({loading:true}, this.loadMessagesFromServer)
        }
    }
    onChatMessageSubmit(text:string)
    {
        let conversation = this.getConversation()
        let tempId = `${conversation.id}_${this.props.profile.id}_${Date.now()}`
        let tempMessage = this.getChatMessagePreview(text, tempId)
        this.appendMessage(tempMessage)
        this.props.queueAddChatMessage(tempMessage)
        sendMessageToConversation(conversation.id, text,tempId)
    }
    appendMessage(message:Message)
    {
        let messages = this.state.data.map(m => m)
        messages.unshift(message)
        this.setState({data:messages, total:this.state.total + 1, offset:this.state.offset + 1})
    }
    getChatMessagePreview(text:string, uid:string):Message {
        let now = Date.now()
        let conversation = this.getConversation()
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
        let conversation = this.getConversation()
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
        let conversation = this.getConversation()
        let messages = this.state.data
        let me = this.props.profile.id
        return(
            <FullPageComponent>
                <div className="d-none d-sm-block col-lg-4 col-md-4 col-sm-5">
                    <Conversations />
                </div>
                <div className="col-lg-8 col-md-8 col-sm-7 col-xs-12">
                    <div id="conversation-view" className="full-height">
                        {conversation && <h3><span className="text-truncate d-block">{getConversationTitle(conversation, me)}</span></h3>}
                            <ChatMessageList conversation={conversation.id} loading={this.state.loading} chatDidScrollToTop={this.chatDidScrollToTop} messages={messages} current_user={this.props.profile} >
                                {this.renderSomeoneIsTyping()}
                            </ChatMessageList>
                        <ChatMessageComposer onSubmit={this.onChatMessageSubmit} onDidType={this.onDidType} />
                    </div>
                </div>
               
              </FullPageComponent>
        );
    }
}
const mapStateToProps = (state:RootReducer) => {
    return {
        conversations:state.conversationStore.conversations,
        profile:state.profile
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        queueAddChatMessage:(message:Message) => {
            dispatch(Actions.queueAddChatMessage(message))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ConversationView);