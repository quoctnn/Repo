import * as React from 'react';
import * as Actions from "../../actions/Actions" 
import { connect } from 'react-redux'
import LoadingSpinner from '../../components/general/LoadingSpinner';
import { translate } from '../../components/intl/AutoIntlProvider';
import { RootReducer } from '../../reducers';
import { Conversation } from '../../reducers/conversationStore';
import ConversationItem from '../../components/general/ConversationItem';
import { FullPageComponent } from '../../components/general/FullPageComponent';
import { PaginationUtilities } from '../../utilities/PaginationUtilities';
import { nullOrUndefined, cloneDictKeys } from '../../utilities/Utilities';
import { addSocketEventListener, SocketMessageType, removeSocketEventListener } from '../../components/general/ChannelEventStream';
import { UserProfile } from '../../reducers/profileStore';
import { Settings } from '../../utilities/Settings';
import { TypingIndicator } from '../../components/general/TypingIndicator';
import { Avatar } from '../../components/general/Avatar';
import { getProfileById } from '../../main/App';
import { conversationReducerPageSize } from '../../reducers/conversations';
import * as moment from 'moment-timezone';
let timezone = moment.tz.guess()

require("./Conversations.scss");
export interface Props {
    total:number,
    isFetching:boolean,
    items:Conversation[],
    requestNextConversationPage?:(page:number) => void,
    offset:number,
    error:string,
    profile:UserProfile,
    preventShowTyingInChatId:number,
    last_fetched:number,
    className?:string,
    activeConversation?:number
}
type IsTypingStore = {[conversation:number]:{[user:number]:NodeJS.Timer}}
export interface State {
    isTyping:IsTypingStore,
}
class Conversations extends React.Component<Props, {}> {     
    state:State
    static defaultProps:Props = {
        total:0,
        isFetching:false,
        items:[],
        offset:0,
        error:null,
        profile:null,
        preventShowTyingInChatId:null,
        last_fetched:null
    }
    constructor(props) {
        super(props);
        this.state = {
            isTyping:{},
        }
        this.loadFirstData = this.loadFirstData.bind(this)
        this.loadNextPageData = this.loadNextPageData.bind(this) 
        this.onScroll = this.onScroll.bind(this) 
        this.isTypingHandler = this.isTypingHandler.bind(this) 
        this.removeUserFromIsTypingData = this.removeUserFromIsTypingData.bind(this)
        
    }
    componentWillMount()
    {
        this.loadFirstData()
    }
    componentDidMount()
    {
        addSocketEventListener(SocketMessageType.CONVERSATION_TYPING, this.isTypingHandler)
    }
    componentWillUnmount()
    {
        removeSocketEventListener(SocketMessageType.CONVERSATION_TYPING, this.isTypingHandler)
    }
    isTypingHandler(event:CustomEvent)
    {
        let user = event.detail.user
        let conversation = event.detail.conversation
        if((this.props.preventShowTyingInChatId && this.props.preventShowTyingInChatId == conversation) || user == this.props.profile.id || !this.props.items.find(i => i.id == conversation))
        {
            return
        }
        let st = this.state.isTyping
        let it = cloneDictKeys(st) as IsTypingStore
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
    removeUserFromIsTypingData(conversation:number, user:number)
    {
        let st = this.state.isTyping
        let it = cloneDictKeys(st) as IsTypingStore
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
    loadFirstData(ignoreError = false)
    {
        let hasError = ignoreError ? false : !nullOrUndefined( this.props.error )
        if(this.props.isFetching || hasError)
        {
            return
        }
        let pageSize = conversationReducerPageSize
        if(this.props.total == 0 || this.props.offset == 0 || (!this.props.last_fetched && this.props.offset <= pageSize))
            this.props.requestNextConversationPage(this.props.offset) 
    }
    loadNextPageData()
    {
        if(this.props.total > this.props.offset && !this.props.isFetching && nullOrUndefined( this.props.error ))
            this.props.requestNextConversationPage(this.props.offset)
    }
    renderLoading() {
        if (this.props.isFetching) {
            return (<li key="loading"><LoadingSpinner/></li>)
        }
    }
    onScroll(event:React.UIEvent<HTMLUListElement>)
    {
        let isAtBottom = event.currentTarget.scrollTop + event.currentTarget.offsetHeight >= event.currentTarget.scrollHeight
        if(isAtBottom)
        {
            this.loadNextPageData()
        }
    }
    renderSomeoneIsTyping(conversationId:number)
    {
        let isTypingData = this.state.isTyping[conversationId]
        if(isTypingData)
        {
            let keys = Object.keys(isTypingData).map(s => parseInt(s))
            return <div className="is-typing-container">
            {keys.map((data, index) => {
                let avatar = getProfileById(data).avatar
                return (<Avatar key={index} image={avatar} size={24}/>)

            })}
            <TypingIndicator />
            </div>
        }
        return null
    }
    timeAgo(time:string):boolean
    {
        let date = moment.utc(time).tz(timezone);
        return moment().diff(date, "minutes") < 1
    }
    conversationItemClassName(c:Conversation)
    {
        return (this.timeAgo(c.updated_at) ? "highlight-insert": "")
    }
    render()
    {
        let conversations = this.props.items
        
        return (<FullPageComponent> 
                    <div id="conversations-view" className={"card full-height col-sm" + (this.props.className ? " " + this.props.className : "")}>
                        <div className="card-header grey">
                            <span className="text-truncate d-block">{translate("Conversations")}</span>
                        </div>
                        <div className="card-body full-height">
                            <ul onScroll={this.onScroll} className="group-list vertical-scroll">
                                {conversations.map((c, index) => {
                                    return (<ConversationItem isActive={c.id == this.props.activeConversation} className={this.conversationItemClassName(c) } key={index} conversation={c}>
                                               {this.renderSomeoneIsTyping(c.id)} 
                                            </ConversationItem>)
                                }) }
                                {this.renderLoading()}
                            </ul>
                        </div>
                    </div>
                </FullPageComponent>)
    }
}
const mapStateToProps = (state:RootReducer) => {
    const pagination = state.conversations.pagination
    const allItems = state.conversations.items
    const isFetching = pagination.fetching
    const items = PaginationUtilities.getCurrentPageResults(allItems, pagination)
    const total = pagination.totalCount
    const offset = items.length
    const error = pagination.error
    const last_fetched = pagination.last_fetch
    return {
        isFetching,
        items,
        total,
        offset,
        error,
        profile:state.profile,
        last_fetched
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        requestNextConversationPage:(page:number) => {
            dispatch(Actions.requestNextConversationPage(page))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Conversations);