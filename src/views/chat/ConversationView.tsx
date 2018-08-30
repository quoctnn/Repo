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
require("./ConversationView.scss");

export interface Props {
    match:any,
    conversations:Conversation[],
    profile:UserProfile
}
export interface State {
    data:Message[],
    loading:boolean,
    offset:number,
    pageSize:number,
    total:number
}
class ConversationView extends React.Component<Props, {}> {

    static fullPage = "full-page"
    added = false
    state:State
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            offset:0,
            loading: true,
            total:0,
            pageSize:this.calculatePageSize(100)
        }
        this.onMessagesReceived = this.onMessagesReceived.bind(this)
        this.loadMessagesFromServer = this.loadMessagesFromServer.bind(this)
        this.chatDidScrollToTop = this.chatDidScrollToTop.bind(this)

    }
    componentDidMount()
    {
        this.loadMessagesFromServer()
    }
    calculatePageSize(elementMinHeight:number)
    {
        return Math.ceil( screen.height * 3 / elementMinHeight / 10) * 10
    }
    componentWillUnmount()
    {
        if(this.added)
            document.body.classList.remove(ConversationView.fullPage)
    }
    componentWillMount()
    {
        if(!document.body.classList.contains(ConversationView.fullPage))
        {
            this.added = true
            document.body.classList.add(ConversationView.fullPage)
        }
    }
    shouldComponentUpdate(nextProps:Props, nextState:State)
    {
        let currentConversation = this.getConversation()
        let nextConversation = this.getConversation(nextProps)
        if(currentConversation && nextConversation && currentConversation.updated_at == nextConversation.updated_at && nextState.data == this.state.data)
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
    render() {
        let conversation = this.getConversation()
        let messages = this.state.data
        return(
            <div id="conversation-view" className="full-height">
                {conversation && <div>{conversation.title || "No title"}</div>}
                {this.renderLoading()}
                <ChatMessageList chatDidScrollToTop={this.chatDidScrollToTop} messages={messages} current_user={this.props.profile} />
            </div>
            
        );
    }
}
const mapStateToProps = (state:RootReducer) => {
    return {
        conversations:state.conversationStore.conversations,
        profile:state.profile
    };
}
export default connect(mapStateToProps, null)(ConversationView);