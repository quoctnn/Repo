import * as React from "react";
import { tz, utc } from "moment-timezone";
import { Message } from '../../reducers/conversationStore';
import {ScrollPosition} from '../../utilities/Utilities';
import { UserProfile } from '../../reducers/profileStore';
import { ChatMessage, MessagePosition } from './ChatMessage';
import { DayLine } from './DayLine';
import { ChatMessageUser } from './ChatMessageUser';
import { ChatMessageTime } from './ChatMessageTime';
require("./ChatMessageList.scss");
let timezone = tz.guess()

export interface Props {
    messages:Message[],
    current_user:UserProfile,
    chatDidScrollToTop:() => void,
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
        this.SCROLL_POSITION = new ScrollPosition(document.querySelector('.message-list'))
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.messages != this.props.messages || nextProps.children != this.props.children ;
    }

    componentWillUpdate(nextProps, nextState) {
        if (this.listUpdateAfterInitialRender(this.props, nextProps)) {
            this.SCROLL_POSITION.prepareFor('up')
        }
        this.wasAtBottomBeforeUpdate = this.listRef.current.scrollTop + this.listRef.current.offsetHeight >= this.listRef.current.scrollHeight - this.scrollToBottomThreshold 
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.listUpdateAfterInitialRender(prevProps, this.props)) {
            this.SCROLL_POSITION.restore()
        } else if (prevProps.messages.length == 0 && this.props.messages.length > 0) {
            this.scrollListToBottom()
        } else if (prevProps.messages.length > 0 && prevProps.messages[prevProps.messages.length - 1].id != this.props.messages[this.props.messages.length - 1].id) {
            this.scrollListToBottom()
        } else if (this.wasAtBottomBeforeUpdate)
        {
            this.scrollListToBottom()
        }
        
    }
    listUpdateAfterInitialRender(prevProps, currentProps:Props) {
        return prevProps.messages.length != 0 &&
            (prevProps.messages.length < currentProps.messages.length)  
    }
    scrollListToBottom() {
        this.listRef.current.scrollTop = this.listRef.current.scrollHeight
    }
    getDirection(message:Message):MessagePosition {
        let userId = this.props.current_user.id;
        return (message.user.id == userId) ? MessagePosition.RIGHT : MessagePosition.LEFT
    }
    onChatScroll(event)
    {
        if (event.currentTarget.scrollTop == 0) { // On top
            this.props.chatDidScrollToTop()
        }
    }
    render() {
        let components = [];
        let lastUser = null, lastDay = null;
        let messages = this.props.messages
        let messageTimeDist = 5;
        for (let i = messages.length - 1; i >= 0; i--) {
            let message = messages[i]
            let currentDate = utc(message.created_at).tz(timezone);
            let showUserName = false;
            let showTime = false

            if (!currentDate.isSame(lastDay, 'day')) // not same day as last message
            {
                components.push(
                    <DayLine key={i + "dayline"} date={message.created_at}/>
                )
                if(message.user.id != this.props.current_user.id)//if not message from current user
                    showUserName = true;
                showTime = true;
            }
            if (lastUser && lastUser.id != message.user.id) //switching user
            {
                if(message.user.id != this.props.current_user.id) //if not message from current user
                    showUserName = true;
                showTime = true
            }
            if(lastUser && lastUser.id == this.props.current_user.id && currentDate.diff(lastDay, "minutes") > messageTimeDist)
            {
                showTime = true
            }
            if(showUserName)
            {
                components.push(
                    <ChatMessageUser key={i + "user"} user={message.user} direction={this.getDirection(message)} />
                )
            }
            if(showTime)
            {
                components.push(
                    <ChatMessageTime key={i + "time"} data={message} direction={this.getDirection(message)}/>
                )
            }
            components.push(
                <ChatMessage data={message}
                         key={message.id}
                         direction={this.getDirection(message)}/>
            )
            lastUser = message.user;
            lastDay = currentDate;
        }
        return (

            <ul onScroll={this.onChatScroll} className="list-unstyled message-list" ref={this.listRef}>
                {components}
                {this.props.children}
            </ul>
        )
    }
}