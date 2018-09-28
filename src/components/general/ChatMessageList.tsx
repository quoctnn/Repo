import { getProfileById } from '../../main/App';
import * as React from 'react';
import * as moment from 'moment-timezone';
import { Message } from '../../reducers/conversations';
import {ScrollPosition} from '../../utilities/Utilities';
import { UserProfile } from '../../reducers/profileStore';
import { ChatMessage, MessagePosition } from './ChatMessage';
import { DayLine } from './DayLine';
import { ChatMessageUser } from './ChatMessageUser';
import LoadingSpinner from './LoadingSpinner';
require("./ChatMessageList.scss");
let timezone = moment.tz.guess()
export interface Props {
    messages:Message[],
    current_user:UserProfile,
    chatDidScrollToTop:() => void,
    loading:boolean,
    children?:React.ReactNode
    conversation:number
}
export class ChatMessageList extends React.Component<Props, {}> {
    SCROLL_POSITION:any = null
    wasAtBottomBeforeUpdate:boolean = false
    scrollToBottomThreshold = 50
    private listRef = React.createRef<HTMLUListElement>()
    constructor(props) {
        super(props)
        this.getDirection = this.getDirection.bind(this)
        this.onChatScroll = this.onChatScroll.bind(this)
    }

    componentDidMount() {
        if (this.props.messages.length > 0) {
            this.scrollListToBottom()
        }
        this.SCROLL_POSITION = new ScrollPosition(document.querySelector('.message-list'))
    }

    shouldComponentUpdate(nextProps:Props, nextState) {
        return nextProps.messages != this.props.messages || nextProps.children != this.props.children || nextProps.loading != this.props.loading || nextProps.conversation != this.props.conversation;
    }

    componentWillUpdate(nextProps:Props, nextState) {
        console.log("ChatMessageList will update")
        if (this.listUpdateAfterInitialRender(this.props, nextProps)) {
            this.SCROLL_POSITION.prepareFor('up')
        }
        this.wasAtBottomBeforeUpdate = this.listRef.current.scrollTop + this.listRef.current.offsetHeight >= this.listRef.current.scrollHeight - this.scrollToBottomThreshold 
    }

    componentDidUpdate(prevProps:Props, prevState) {
        if (this.listUpdateAfterInitialRender(prevProps, this.props)) {
            this.SCROLL_POSITION.restore()
        } else if (prevProps.messages.length == 0 && this.props.messages.length > 0) {
            this.scrollListToBottom()
        } else if (prevProps.messages.length > 0 && this.props.messages.length > 0 && prevProps.messages[prevProps.messages.length - 1].id != this.props.messages[this.props.messages.length - 1].id) {
            this.scrollListToBottom()
        } else if (this.wasAtBottomBeforeUpdate)
        {
            this.scrollListToBottom()
        }
        
    }
    listUpdateAfterInitialRender(prevProps:Props, currentProps:Props) {
        return prevProps.messages.length != 0 &&
            (prevProps.messages.length < currentProps.messages.length)  
    }
    scrollListToBottom() {
        this.listRef.current.scrollTop = this.listRef.current.scrollHeight
    }
    getDirection(message:Message):MessagePosition {
        let userId = this.props.current_user.id;
        return (message.user == userId) ? MessagePosition.RIGHT : MessagePosition.LEFT
    }
    onChatScroll(event)
    {
        if (event.currentTarget.scrollTop == 0) { // On top
            this.props.chatDidScrollToTop()
        }
    }

    renderLoading() {
        if (this.props.loading) {
            return (<li><LoadingSpinner/></li>)
        }
    }
    render() {
        let components = [];
        let lastUserId = null, lastDay = null;
        let messages = this.props.messages
        let messageTimeDist = 5;
        for (let i = messages.length - 1; i >= 0; i--) {
            let message = messages[i]
            let currentDate = moment.utc(message.created_at).tz(timezone);
            let showTime = false
            let isMessageFromCurrentUser = message.user == this.props.current_user.id

            if (!currentDate.isSame(lastDay, 'day')) // not same day as last message
            {
                components.push(
                    <DayLine key={i + "dayline"} date={message.created_at}/>
                )
                showTime = true;
            }
            if (lastUserId && lastUserId != message.user) //switching user
            {
                showTime = true
            }
            if(lastUserId && lastUserId == this.props.current_user.id && currentDate.diff(lastDay, "minutes") > messageTimeDist)
            {
                showTime = true
            }
            if(showTime)
            {
                var str = moment(message.created_at).tz(timezone).format("LT");
                var avatar = null
                if(!isMessageFromCurrentUser)
                {
                    let user = getProfileById(message.user)
                    str = `${user.first_name}, ${str}` 
                    avatar = user.avatar
                }

                components.push(
                    <ChatMessageUser key={i + "user"} avatar={avatar} text={str} direction={this.getDirection(message)} />
                )
            }
            components.push(
                <ChatMessage data={message}
                         key={message.id}
                         direction={this.getDirection(message)}/>
            )
            lastUserId = message.user;
            lastDay = currentDate;
        }
        return (

            <ul onScroll={this.onChatScroll} className="list-unstyled message-list vertical-scroll full-height" ref={this.listRef}>
                {this.renderLoading()}
                {components}
                {this.props.children}
            </ul>
        )
    }
}