import * as React from 'react';
import * as Actions from "../../actions/Actions" 
import { connect } from 'react-redux'
import LoadingSpinner from '../../components/general/LoadingSpinner';
import { translate } from '../../components/intl/AutoIntlProvider';
import { RootState } from '../../reducers';
import ConversationItem from '../../components/general/ConversationItem';
import { FullPageComponent } from '../../components/general/FullPageComponent';
import { PaginationUtilities } from '../../utilities/PaginationUtilities';
import { nullOrUndefined, cloneDictKeys } from '../../utilities/Utilities';
import { EventStreamMessageType} from '../../components/general/ChannelEventStream';
import { Settings } from '../../utilities/Settings';
import { TypingIndicator } from '../../components/general/TypingIndicator';
import { Avatar } from '../../components/general/Avatar';
import { conversationReducerPageSize } from '../../reducers/conversations';
import * as moment from 'moment-timezone';
import { Link } from 'react-router-dom';
import { Routes } from '../../utilities/Routes';
import { List } from '../../components/general/List';
import { NotificationCenter } from '../../notifications/NotificationCenter';
import { ProfileManager } from '../../managers/ProfileManager';
import { UserProfile, Conversation } from '../../types/intrasocial_types';
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
    total:number,
    isFetching:boolean,
    items:Conversation[],
    offset:number,
    error:string,
    authenticatedProfile:UserProfile,
    last_fetched:number,
    pagingDirty:boolean
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
        pagingDirty:false
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
                let avatar = ProfileManager.getProfile(data).avatar
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
                        <div className="card-header grey d-flex align-items-center">
                            <span className="text-truncate d-block flex-grow-1">{translate("Conversations")}</span>
                            <div className="flex-shrink-0">
                                <Link className="btn btn-primary rounded-circle flex-shrink-0" to={Routes.CONVERSATION_CREATE}><i className="fas fa-plus"></i></Link>
                            </div>
                        </div>
                        <div className="card-body full-height">
                            <List onScroll={this.onScroll} className="group-list vertical-scroll">
                                {conversations.map((c, index) => {
                                    return (<ConversationItem isActive={c.id == this.props.activeConversation} className={this.conversationItemClassName(c) } list-key={c.id} key={c.id} conversation={c}>
                                               {this.renderSomeoneIsTyping(c.id)} 
                                            </ConversationItem>)
                                }) }
                                {this.renderLoading()}
                            </List>
                        </div>
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
        pagingDirty
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