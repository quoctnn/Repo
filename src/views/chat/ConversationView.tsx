import Conversations from './Conversations';
import * as React from 'react';
import { connect } from 'react-redux'
import { RootState } from '../../reducers/index';
import { ChatMessageList } from '../../components/general/ChatMessageList';
import { ChatMessageComposer } from '../../components/general/ChatMessageComposer';
import { EventStreamMessageType } from '../../components/general/ChannelEventStream';
import { Settings } from '../../utilities/Settings';
import { TypingIndicator } from '../../components/general/TypingIndicator';
import { Avatar } from '../../components/general/Avatar';
import { cloneDictKeys, nullOrUndefined } from '../../utilities/Utilities';
import * as Actions from '../../actions/Actions'; 
import { FullPageComponent } from '../../components/general/FullPageComponent';
import { getConversationTitle } from '../../utilities/ConversationUtilities';
import { PaginationUtilities } from '../../utilities/PaginationUtilities';
import { QueueUtilities } from '../../utilities/QueueUtilities';
import { messageReducerPageSize } from '../../reducers/messages';
import { Mention } from '../../components/input/MentionEditor';
import { ConversationManager } from '../../managers/ConversationManager';
import { NotificationCenter } from '../../notifications/NotificationCenter';
import { ProfileManager } from '../../managers/ProfileManager';
import { UserProfile, Conversation, Message } from '../../types/intrasocial_types';
import { getDefaultCachePageV3, CachePageV3 } from '../../reducers/simpleMultiPaginator';

require("./ConversationView.scss")

const reducer = (accumulator, currentValue) => accumulator + currentValue;
const uidToNumber = (uid) => uid.split("_").map(n => parseInt(n)).reduce(reducer)
const messageToUid = (message:Message) => message.conversation + "_" + message.user + "_" + new Date(message.updated_at).getTime()
export interface OwnProps {
    match:any,
    conversation:Conversation,
    authenticatedProfile:UserProfile,
    isFetching:boolean,
    total:number,
    offset:number,
    items:Message[],
    conversationId:number,
    error:string,
    queuedMessages:Message[],
    last_fetched:number,
    content:string
    mentions:Mention[]
    
}
export interface ReduxProps 
{
    availableMentions:Mention[]
    pagingDirty:boolean
    signedIn:boolean
}
interface ReduxDispatchProps
{
    requestNextMessagePage:(conversation:number, offset:number) => void
    setMessagePageNotFetching:(conversation:number) => void
}
type Props = ReduxDispatchProps & OwnProps & ReduxProps
export interface State {
    isTyping:object
    loading:boolean
    fullScreen:boolean
    renderDropZone:boolean
}

class ConversationView extends React.PureComponent<Props, State> {
    static maxRetries = 3
    clearSomeoneIsTypingTimer:NodeJS.Timer = null
    dragCount:number = 0
    canPublishDidType = true
    private dropTarget = React.createRef<HTMLDivElement>();
    constructor(props) {
        super(props)
        this.state = {
            isTyping:{},
            loading:false,
            fullScreen:false,
            renderDropZone:false,
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
        this.onDragOver = this.onDragOver.bind(this)
        this.onDrop = this.onDrop.bind(this)
        this.onDragLeave = this.onDragLeave.bind(this)
        this.onDragEnter = this.onDragEnter.bind(this)
        this.handleMentionSearch = this.handleMentionSearch.bind(this)
    }
    componentDidMount()
    {
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_TYPING, this.isTypingHandler)
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_MESSAGE, this.incomingMessageHandler)
        ConversationManager.ensureConversationExists(this.props.conversationId, () => {})
    }
    incomingMessageHandler(...args:any[])
    {
        let message = args[0] as Message
        let conversation = this.props.conversationId
        if(message.conversation == conversation)
        {
            let it = this.removeUserFromIsTypingData(message.user)
            ConversationManager.markConversationAsRead(conversation, () => {})
            this.setState({isTyping:it })
        }
    }
    isTypingHandler(...args:any[])
    {
        let object = args[0]
        let user = object.user
        let conversation = object.conversation
        if(user == this.props.authenticatedProfile.id || conversation != this.props.conversationId)
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
        NotificationCenter.removeObserver("eventstream_" + EventStreamMessageType.CONVERSATION_TYPING, this.isTypingHandler)
        NotificationCenter.removeObserver("eventstream_" + EventStreamMessageType.CONVERSATION_MESSAGE, this.incomingMessageHandler)
    }
    componentWillMount()
    {
        this.loadFirstData(true)
        this.markConversationAsRead(true)
    }
    componentDidUpdate(prevProps:Props)
    {
        let isNewConversation = this.props.conversationId != prevProps.conversationId
        console.log("componentDidUpdate: ","isNewConversation(" + isNewConversation + ")",  this.props.signedIn, this.props.pagingDirty)
        if (!isNewConversation && this.props.signedIn && (this.props.pagingDirty && !prevProps.pagingDirty || !prevProps.signedIn))
        {
            this.loadFirstData(true)
        }
        else if(isNewConversation)
        {
            this.loadFirstData(true)
        }
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
    shouldComponentUpdate3(nextProps:Props, nextState:State)
    {
        let currentConversation = this.props.conversation
        let nextConversation = nextProps.conversation
        if(nextState.renderDropZone == this.state.renderDropZone && nextState.fullScreen == this.state.fullScreen && nextProps.isFetching == this.props.isFetching && currentConversation && nextConversation && currentConversation.id == nextConversation.id && currentConversation.updated_at == nextConversation.updated_at && nextProps.items == this.props.items && 
            this.isTypingDictEqual(nextState.isTyping, this.state.isTyping))
            return false
        let k = nextProps.items == this.props.items
        return true
    }
    loadFirstData(ignoreError = false)
    {
        let hasError = ignoreError ? false : !nullOrUndefined( this.props.error )
        if(this.props.isFetching || hasError)
        {
            if(this.props.isFetching)
                this.props.setMessagePageNotFetching(this.props.conversationId)
            return
        }
        let pageSize = messageReducerPageSize        
        if(this.props.pagingDirty || this.props.total == 0 || this.props.offset == 0 || (!this.props.last_fetched && this.props.offset <= pageSize))
            this.props.requestNextMessagePage(this.props.conversationId, 0)
    }
    loadNextPageData()
    {
        if(this.props.total > this.props.offset && !this.props.isFetching && nullOrUndefined( this.props.error ))
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
        let tempId = `${conversation.id}_${this.props.authenticatedProfile.id}_${Date.now()}`
        this.getChatMessagePreview(text, null, tempId, mentions, conversation, (message) => {
            ConversationManager.sendMessage(message)
        })
    }
    
    getChatMessagePreview(text:string,file:File, uid:string, mentions:number[], conversation:Conversation, completion:(message:Message) => void) {
        let now = Date.now()
        let ds = new Date().toUTCString()
        let tempFile = nullOrUndefined(file) ? null: {file:file, progress:0, name:file.name, size:file.size, type:file.type, error:null}
        let message = {
            id: now,
            uid:uid,
            pending:true,
            text: text,
            user: this.props.authenticatedProfile.id,
            created_at: ds,
            conversation:conversation.id,
            attachment:null,
            updated_at:ds,
            read_by:[],
            mentions:mentions,
            tempFile
        }
        completion(message)
    }
    onDidType(unprocessedText:string)
    {
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
    renderSomeoneIsTyping()
    {
        let keys = Object.keys(this.state.isTyping).map(n => parseInt(n))
        if(keys.length > 0)
        {
            return <li className="is-typing-container">
            {keys.map((id, index) => {
                let avatar = ProfileManager.getProfile(id).avatar
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
            
            let tempId = `${conversation.id}_${this.props.authenticatedProfile.id}_${Date.now()}`
            this.getChatMessagePreview("", f, tempId, [], conversation, (message) => {
                ConversationManager.sendMessage(message)
            })
        })
    }
    onDragOver(event)
    {
        event.preventDefault()
        try 
        {
            event.dataTransfer.dropEffect = "copy"
        } 
        catch (err) { }
    }
    onDrop(event)
    {
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
    removeDragData(event) 
    {
        if (event.dataTransfer.items) 
        {
            event.dataTransfer.items.clear()
        } 
        else 
        {
            event.dataTransfer.clearData()
        }
    }
    onDragLeave(event)
    {
        event.preventDefault()
        this.dragCount -= 1
        if(this.dragCount == 0 && this.state.renderDropZone)
        {
            this.setState({renderDropZone:false})
        }
        console.log("onDragLeave", this.dragCount)
    }
    onDragEnter(event)
    {
        event.preventDefault()
        console.log(event.target.classList)
        this.dragCount += 1
        if(this.dragCount > 0 && !this.state.renderDropZone)
        {
            this.setState({renderDropZone:true})
        }
        console.log("onDragEnter", this.dragCount)
    }
    handleMentionSearch(search:string, completion:(mentions:Mention[]) => void)
    {
        completion(this.props.availableMentions)
    }
    render() {
        let me = this.props.authenticatedProfile
        let conversation = this.props.conversation
        if(!me || !conversation)
        {
            return null
        }
        let myId = me.id
        let messages = this.props.queuedMessages.concat(this.props.items).sort((a,b) => uidToNumber(b.uid || messageToUid(b)) - uidToNumber(a.uid || messageToUid(a)))

        return(
            <FullPageComponent>
                <div className="d-none d-sm-block col-lg-4 col-md-4 col-sm-5 column-left">
                    <Conversations preventShowTyingInChatId={conversation.id} activeConversation={this.props.conversationId} />
                </div>
                <div className={"col-lg-8 col-md-8 col-sm-7" + (this.state.fullScreen ? " full-screen" : "")}>
                    <div id="conversation-view" className="card full-height">
                        <div className="card-header grey d-flex align-items-center">
                            {conversation && <span className="text-truncate d-block flex-grow-1">{getConversationTitle(conversation, myId)}</span>}
                            <div className="flex-shrink-0">
                                <button className="btn flex-shrink-0" onClick={this.resizeButtonClick} ><i className="fas fa-expand"></i></button>
                            </div>
                        </div>
                        <div ref={this.dropTarget} className={"droptarget card-body full-height" + (this.state.renderDropZone ? " drop-zone" : "")} onDragOver={this.onDragOver} onDrop={this.onDrop} onDragLeave={this.onDragLeave} onDragEnter={this.onDragEnter}>
                            <ChatMessageList conversation={conversation.id} loading={this.props.isFetching} chatDidScrollToTop={this.chatDidScrollToTop} messages={messages} current_user={this.props.authenticatedProfile} >
                                {this.renderSomeoneIsTyping()}
                            </ChatMessageList>
                        </div>
                        <ChatMessageComposer className="secondary-text" mentionSearch={this.handleMentionSearch} content={this.props.content} mentions={this.props.mentions} filesAdded={this.filesAdded} onSubmit={this.onChatMessageSubmit} onDidType={this.onDidType} />
                    </div>
                </div>
               
              </FullPageComponent>
        );
    }
}
const mapStateToProps = (state:RootState, ownProps:Props) => {
    let id = ownProps.match.params.conversationid
    const pagination:CachePageV3<Message> = state.messages.conversations[id] || getDefaultCachePageV3<Message>()
    const allItems = pagination.items
    const isFetching = pagination.fetching
    const items = PaginationUtilities.getCurrentPageResults(allItems, pagination)
    const total = pagination.totalCount
    const error = pagination.error
    const offset = pagination.position
    const queuedMessages = QueueUtilities.getQueuedMessageForConversation(id, state.queue.chatMessages)
    const last_fetched = pagination.last_fetch
    const conversation = state.conversations.pagination.items[id]
    const availableMentions = conversation ? conversation.users.map(u => {
        let p = ProfileManager.getProfile(u)
        return p ? Mention.fromUser(p) : null
    }).filter(n => n != null) : []
    const pagingDirty = pagination.dirty
    return {
        error,
        conversationId:id,
        isFetching,
        total,
        offset,
        items,
        conversation:conversation,
        authenticatedProfile:state.auth.profile,
        queuedMessages,
        last_fetched,
        availableMentions:availableMentions,
        pagingDirty,
        signedIn:state.auth.signedIn,
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        requestNextMessagePage:(conversation:number, offset:number) => {
            dispatch(Actions.requestNextMessagePage(conversation.toString(), offset))
        },
        setMessagePageNotFetching:(conversation:number) => {
            dispatch(Actions.setMessagePageNotFetching(conversation.toString()))
        },
    }
}
export default connect<{}, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ConversationView);
