import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./ConversationsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { ContextNaturalKey, Conversation, UserProfile } from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import SimpleModule from '../SimpleModule';
import { translate } from '../../localization/AutoIntlProvider';
import ListComponent from '../../components/general/ListComponent';
import ApiClient, { PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import ConversationListItem from './ConversationListItem';
import { TypingIndicator } from '../../components/general/TypingIndicator';
import { Avatar } from '../../components/general/Avatar';
import { ProfileManager } from '../../managers/ProfileManager';
import { EventSubscription } from 'fbemitter';
import { NotificationCenter } from '../../utilities/NotificationCenter';
import { EventStreamMessageType } from '../../network/ChannelEventStream';
import { Settings } from '../../utilities/Settings';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { uniqueId } from '../../utilities/Utilities';
import { ContextManager } from '../../managers/ContextManager';
type IsTypingStore = {[conversation:number]:{[user:number]:NodeJS.Timer}}
type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
}
type DefaultProps = {
    activeConversation:number
    preventShowTyingInChatId:number,
}
type State = {
    isLoading:boolean
    isTyping:IsTypingStore
    listRedrawContext?:string
}
type ReduxStateProps = {
    authenticatedUser:UserProfile
    conversation:Conversation
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps & DefaultProps

class ConversationsModule extends React.Component<Props, State> {  
    conversationsList = React.createRef<ListComponent<Conversation>>()
    private observers:EventSubscription[] = []
    static defaultProps:DefaultProps = {
        activeConversation:-1,
        preventShowTyingInChatId:-1
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            isTyping:{}
        }
    }
    componentDidMount = () => {
        const obs1 = NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_TYPING, this.isTypingHandler)
        this.observers.push(obs1)
        const obs2 = NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_NEW, this.processIncomingConversation)
        this.observers.push(obs2)
        const obs3 = NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_UPDATE, this.processIncomingConversation)
        this.observers.push(obs3)
    }
    componentWillUnmount = () =>
    {
        this.observers.forEach(o => o.remove())
    }
    processIncomingConversation = (...args:any[]) => 
    {
        let conversation = args[0] as Conversation
        this.conversationsList.current.safeUnshift(conversation)
        this.setState((prevState:State) => {
            return {listRedrawContext:uniqueId()}
        })
    }
    isTypingHandler = (...args:any[]) => {
        let object = args[0]
        let user = object.user
        let conversation = object.conversation
        if((this.props.preventShowTyingInChatId && this.props.preventShowTyingInChatId == conversation) || user == this.props.authenticatedUser.id || !this.conversationsList.current.getItemById(conversation))
        {
            return
        }
        let it = {...this.state.isTyping}
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
    removeUserFromIsTypingData = (conversation:number, user:number) => {
        let it = {...this.state.isTyping}
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
    componentDidUpdate = (prevProps:Props) => {
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    headerClick = (e) => {
        //NavigationUtilities.navigateToNewsfeed(this.props.history, context && context.type, context && context.id, this.state.includeSubContext)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    fetchConversations = (offset:number, completion:(items:PaginationResult<Conversation>) => void ) => {
        ApiClient.getConversations( 30, offset, (data, status, error) => {
            completion(data)
            ToastManager.showErrorToast(error)
        })
    }
    renderSomeoneIsTyping = (conversationId:number) => {
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
    renderConversation = (conversation:Conversation) =>  {
        const isActive = this.props.conversation && (this.props.conversation.id == conversation.id)
        return <ConversationListItem key={conversation.id} conversation={conversation} isActive={isActive} >
                {this.renderSomeoneIsTyping(conversation.id)}
                </ConversationListItem>
    }
    renderEmpty = () => {
        return <div>{"Empty List"}</div>
    }
    sortItems = (conversations:Conversation[]) => {
        const sorted = conversations.sort((a, b) =>  new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        return sorted
    }
    renderContent = () => {

        const {} = this.props
        return <>
            <ListComponent<Conversation> 
                        ref={this.conversationsList} 
                        renderEmpty={this.renderEmpty}
                        onLoadingStateChanged={this.feedLoadingStateChanged} 
                        fetchData={this.fetchConversations} 
                        sortItems={this.sortItems}
                        redrawContext={this.state.listRedrawContext}
                        renderItem={this.renderConversation} className="conversations-module-list" />
            </>
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("conversations-module", className)
        return (<SimpleModule {...rest} 
                    className={cn} 
                    headerClick={this.headerClick} 
                    breakpoint={breakpoint} 
                    isLoading={this.state.isLoading} 
                    headerTitle={translate("conversations.module.title")}>
                {this.renderContent()}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const authenticatedUser = AuthenticationManager.getAuthenticatedUser()
    const conversation = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.CONVERSATION) as Conversation
    return {
        authenticatedUser,
        conversation
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ConversationsModule))