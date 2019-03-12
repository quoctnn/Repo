import * as React from 'react';
import * as Actions from "../../actions/Actions" 
import { connect } from 'react-redux'
import LoadingSpinner from '../../components/general/LoadingSpinner';
import { RootState } from '../../reducers';
import ConversationItem from '../../components/general/ConversationItem';
import { FullPageComponent } from '../../components/general/FullPageComponent';
import { PaginationUtilities } from '../../utilities/PaginationUtilities';
import { nullOrUndefined, cloneDictKeys } from '../../utilities/Utilities';
import { Settings } from '../../utilities/Settings';
import { TypingIndicator } from '../../components/general/TypingIndicator';
import { Avatar } from '../../components/general/Avatar';
import { conversationReducerPageSize } from '../../reducers/conversations';
import * as moment from 'moment-timezone';
import { List } from '../../components/general/List';
import { NotificationCenter } from '../../notifications/NotificationCenter';
import { ProfileManager } from '../../managers/ProfileManager';
import { UserProfile, Conversation } from '../../types/intrasocial_types2';
import { EventStreamMessageType } from '../../app/network/ChannelEventStream';
let timezone = moment.tz.guess()

require("./Conversations.scss");

export interface OwnProps 
{
    activeConversation?:number
    preventShowTyingInChatId:number,
    className?:string,
}
interface ReduxStateProps 
{
    total:number
    isFetching:boolean
    items:Conversation[]
    offset:number
    error:string
    authenticatedProfile:UserProfile
    last_fetched:number
    pagingDirty:boolean
    signedIn:boolean
}
interface ReduxDispatchProps 
{
    requestNextConversationPage?:(page:number) => void
    setConversationPageNotFetching?:() => void
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
type IsTypingStore = {[conversation:number]:{[user:number]:NodeJS.Timer}}

interface State {
    isTyping:IsTypingStore,
}
class Conversations extends React.PureComponent<Props, State> {     
    state:State
    static defaultProps:Props = {
        total:0,
        isFetching:false,
        items:[],
        offset:0,
        error:null,
        authenticatedProfile:null,
        preventShowTyingInChatId:null,
        last_fetched:null,
        pagingDirty:false,
        signedIn:false,
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
        this.loadFirstData(true)
    }
    componentDidMount()
    {
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_TYPING, this.isTypingHandler)
    }
    componentWillUnmount()
    {
        NotificationCenter.removeObserver("eventstream_" + EventStreamMessageType.CONVERSATION_TYPING, this.isTypingHandler)
    }
    componentDidUpdate(prevProps:Props)
    {
        if (this.props.signedIn && (this.props.pagingDirty && !prevProps.pagingDirty || !prevProps.signedIn))
        {
            console.log("componentDidUpdate", this.props.signedIn, this.props.pagingDirty)
            this.loadFirstData(true)
        }
    }
    isTypingHandler(...args:any[])
    {
        let object = args[0]
        let user = object.user
        let conversation = object.conversation
        if((this.props.preventShowTyingInChatId && this.props.preventShowTyingInChatId == conversation) || user == this.props.authenticatedProfile.id || !this.props.items.find(i => i.id == conversation))
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
            if(this.props.isFetching)
                this.props.setConversationPageNotFetching() 
            return
        }
        let pageSize = conversationReducerPageSize
        if(this.props.pagingDirty || this.props.total == 0 || this.props.offset == 0 || (!this.props.last_fetched && this.props.offset <= pageSize))
            this.props.requestNextConversationPage(0) 
    }
    loadNextPageData = () =>
    {
        if(this.props.total > this.props.offset && !this.props.isFetching && nullOrUndefined( this.props.error ))
            this.props.requestNextConversationPage(this.props.offset)
    }
    renderLoading() {
        if (this.props.isFetching) {
            return (<LoadingSpinner key="loading"/>)
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
                let avatar = ProfileManager.getProfileById(data).avatar
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
                    <div id="conversations-view">
                        <List onScroll={this.onScroll} className="group-list vertical-scroll">
                            {conversations.map((c, index) => {
                                return (<ConversationItem isActive={c.id == this.props.activeConversation} className={this.conversationItemClassName(c) } list-key={c.id} key={c.id} conversation={c}>
                                            {this.renderSomeoneIsTyping(c.id)} 
                                        </ConversationItem>)
                            }) }
                            {this.renderLoading()}
                        </List>
                    </div>
                </FullPageComponent>)
    }
}
const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {
    const pagination = state.conversations.pagination
    const allItems = state.conversations.pagination.items
    const isFetching = pagination.fetching
    const items = PaginationUtilities.getCurrentPageResults(allItems, pagination)
    const total = pagination.totalCount
    const offset = pagination.position
    const error = pagination.error
    const last_fetched = pagination.last_fetch
    const pagingDirty = pagination.dirty
    return {
        isFetching,
        items,
        total,
        offset,
        error,
        authenticatedProfile:state.auth.profile,
        last_fetched,
        pagingDirty,
        signedIn:state.auth.signedIn,
    }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {
        requestNextConversationPage:(page:number) => {
            dispatch(Actions.requestNextConversationPage(page))
        },
        setConversationPageNotFetching:() => {
            dispatch(Actions.setConversationPageNotFetching())
        },
    }
}
export default connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(Conversations);