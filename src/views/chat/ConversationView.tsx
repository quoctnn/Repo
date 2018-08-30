import { Conversation, Message } from '../../reducers/conversationStore';
import * as React from 'react';
import { connect } from 'react-redux'
import { RootReducer } from '../../reducers/index';
import { ChatMessageList } from '../../components/general/ChatMessageList';
import { UserProfile } from '../../reducers/profileStore';
import ApiClient from '../../network/ApiClient';
import LoadingSpinner from '../../components/general/LoadingSpinner';
import { toast } from 'react-toastify';
import { ErrorToast } from '../../components/general/Toast';
import { ChatMessageComposer } from '../../components/general/ChatMessageComposer';
import { sendTypingInConversation, addSocketEventListener, SocketMessageType, removeSocketEventListener } from '../../components/general/ChannelEventStream';
import { Settings } from '../../utilities/Settings';
import { TypingIndicator } from '../../components/general/TypingIndicator';
import { Avatar } from '../../components/general/Avatar';
require("./ConversationView.scss");
export interface Props {
    match:any,
    conversations:Conversation[],
    profile:UserProfile,
    profiles:UserProfile[]
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

    static fullPage = "full-page"
    bodyClassAdded = false
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
        
    }
    componentDidMount()
    {
        this.loadMessagesFromServer()
        addSocketEventListener(SocketMessageType.CONVERSATION_TYPING, this.isTypingHandler)
    }
    isTypingHandler(event:CustomEvent)
    {
        let user = event.detail.user
        let it = this.state.isTyping
        let oldUserTimer = it[user]
        if(oldUserTimer)
        {
            clearTimeout(oldUserTimer)
        }
        it[user] = setTimeout(() => 
        {
            let it = this.state.isTyping
            delete it[user]
            this.setState({isTyping:it})

        }, Settings.clearSomeoneIsTypingInterval)
        this.setState({isTyping:it})
    }
    calculatePageSize(elementMinHeight:number)
    {
        return Math.ceil( screen.height * 3 / elementMinHeight / 10) * 10
    }
    componentWillUnmount()
    {
        if(this.bodyClassAdded)
            document.body.classList.remove(ConversationView.fullPage)
        removeSocketEventListener(SocketMessageType.CONVERSATION_TYPING, this.isTypingHandler)
    }
    componentWillMount()
    {
        if(!document.body.classList.contains(ConversationView.fullPage))
        {
            this.bodyClassAdded = true
            document.body.classList.add(ConversationView.fullPage)
        }
    }
    shouldComponentUpdate(nextProps:Props, nextState:State)
    {
        let currentConversation = this.getConversation()
        let nextConversation = this.getConversation(nextProps)
        if(currentConversation && nextConversation && currentConversation.updated_at == nextConversation.updated_at && nextState.data == this.state.data && nextState.isTyping == this.state.isTyping)
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
            return
        }
        let newData = data.results || []
        let oldData = this.state.data.concat(newData)
        this.setState({data:oldData, loading:false, total:data.count, offset:oldData.length })
        console.log("onMessagesReceived", oldData)
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
    renderLoading() {
        if (this.state.loading) {
            return (<LoadingSpinner/>)
        }
    }
    onChatMessageSubmit(text:string)
    {
        console.log("Send message:" , text)
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
            return <div className="is-typing-container">
            {keys.map(id => {
                let avatar = this.props.profiles.find(p => p.id == id).avatar
                return (<Avatar image={avatar} size={24}/>)

            })}
            <TypingIndicator />
            </div>
        }
        return null
    }
    render() {
        let conversation = this.getConversation()
        let messages = this.state.data
        return(
            <div id="conversation-view" className="full-height">
                {conversation && <div>{conversation.title || "No title"}</div>}
                {this.renderLoading()}
                <ChatMessageList chatDidScrollToTop={this.chatDidScrollToTop} messages={messages} current_user={this.props.profile} />
                {this.renderSomeoneIsTyping()}
                <ChatMessageComposer onSubmit={this.onChatMessageSubmit} onDidType={this.onDidType} />
            </div>
            
        );
    }
}
const mapStateToProps = (state:RootReducer) => {
    return {
        conversations:state.conversationStore.conversations,
        profile:state.profile,
        profiles:state.profileStore.profiles
    };
}
export default connect(mapStateToProps, null)(ConversationView);