import * as React from 'react';
import { ScrollPosition, stringToDateFormat, DateFormat, stringToDate, userAvatar } from '../../utilities/Utilities';
import { ChatMessage, MessagePosition } from './ChatMessage';
import { DayLine } from './DayLine';
import { ChatMessageUser } from './ChatMessageUser';
import { ProfileManager } from '../../managers/ProfileManager';
import { Message, UserProfile } from '../../types/intrasocial_types';
import LoadingSpinner from '../../components/LoadingSpinner';
import classnames from 'classnames';
import { ReadObserver } from '../../library/ReadObserver';
import {ApiClient} from '../../network/ApiClient';
export interface Props {
    messages:Message[],
    current_user:UserProfile,
    chatDidScrollToTop:() => void,
    loading:boolean,
    children?:React.ReactNode
    conversation:number
    className?:string
}
export class ChatMessageList extends React.Component<Props & React.HTMLAttributes<HTMLElement>, {}> {
    SCROLL_POSITION:any = null
    wasAtBottomBeforeUpdate:boolean = false
    scrollToBottomThreshold = 50
    private readObserver:ReadObserver = null;
    private listRef = React.createRef<HTMLDivElement>()
    constructor(props:Props) {
        super(props)
    }
    componentWillUnmount = () => {
        if (!!this.readObserver) {
            this.readObserver.save()
            this.readObserver.cleanup()
            this.readObserver = null
        }
        this.SCROLL_POSITION = null
        this.listRef = null
    }
    readObserverActiveStateChanged = (isActive:boolean) => {
        if(isActive && !this.props.current_user.is_anonymous)
        {
            this.readObserver.clearObservables()
            this.forceUpdate()
        }
    }
    componentDidMount = () => {
        if (this.props.messages.length > 0) {
            this.scrollListToBottom()
        }
        this.SCROLL_POSITION = new ScrollPosition(document.querySelector('.message-list'))
        if (!this.props.current_user.is_anonymous)
        {
            this.readObserver = new ReadObserver("messageReads", ApiClient.setMessagesRead, 1000)
            this.readObserver.onActiveStateChanged = this.readObserverActiveStateChanged
            const listRef = this.listRef.current
            if(listRef)
            {
                this.readObserver.initialize(listRef)
            }
        }
    }
    registerObservee = (id:number) => (element:Element) => {
        if(!!element && !!this.readObserver)
            this.readObserver.observe(id, element)
    }
    shouldComponentUpdate = (nextProps:Props, nextState) => {
        return nextProps.messages != this.props.messages || nextProps.children != this.props.children || nextProps.loading != this.props.loading || nextProps.conversation != this.props.conversation;
    }

    UNSAFE_componentWillUpdate = (nextProps:Props, nextState) => {
        if (this.listUpdateAfterInitialRender(this.props, nextProps)) {
            this.SCROLL_POSITION.prepareFor('up')
        }
        this.wasAtBottomBeforeUpdate = this.listRef.current.scrollTop + this.listRef.current.offsetHeight >= this.listRef.current.scrollHeight - this.scrollToBottomThreshold
    }

    componentDidUpdate = (prevProps:Props, prevState) => {
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
    getDirection = (message:Message):MessagePosition => {
        let userId = this.props.current_user.id;
        return (message.user == userId) ? MessagePosition.RIGHT : MessagePosition.LEFT
    }
    onChatScroll = (event) =>
    {
        if (event.currentTarget.scrollTop == 0) { // On top
            this.props.chatDidScrollToTop()
        }
    }
    renderLoading = () => {
        if (this.props.loading) {
            return (<li><LoadingSpinner/></li>)
        }
    }
    render = () => {
        const {messages, current_user, chatDidScrollToTop, loading, children, conversation, className, ...rest} = this.props
        let components = [];
        let lastUserId = null, lastDay = null;
        let messageTimeDist = 5;
        for (let i = messages.length - 1; i >= 0; i--) {
            let message = messages[i]
            let currentDate = stringToDate(message.created_at)
            let showTime = false
            let isMessageFromCurrentUser = message.user == current_user.id

            if (!currentDate.isSame(lastDay, 'day')) // not same day as last message
            {
                components.push(
                    <DayLine key={message.id + "dayline"} date={message.created_at}/>
                )
                showTime = true;
            }
            if (lastUserId && lastUserId != message.user) //switching user
            {
                showTime = true
            }
            if(lastUserId && lastUserId == current_user.id && currentDate.diff(lastDay, "minutes") > messageTimeDist)
            {
                showTime = true
            }
            if(showTime)
            {
                var str = stringToDateFormat(message.created_at, DateFormat.time)
                var avatar:string = null
                let profileId:number = null
                if(!isMessageFromCurrentUser)
                {
                    let user = ProfileManager.getProfileById(message.user)
                    profileId = user.id
                    str = `${user.first_name}, ${str}`
                    avatar = userAvatar(user)
                }
                components.push(
                    <ChatMessageUser key={message.id + "user"} avatar={avatar} profileId={profileId} text={str} direction={this.getDirection(message)} />
                )
            }
            const observerRegister = (message.user == current_user.id || message.read_by.contains(current_user.id) || this.readObserver.getReads().contains(message.id)) ? undefined : this.registerObservee(message.id)
            components.push(

                <ChatMessage
                        innerRef={observerRegister}
                        data={message}
                        key={message.id}
                        direction={this.getDirection(message)}/>
            )
            lastUserId = message.user;
            lastDay = currentDate;
        }
        const cn = classnames("message-list",  className)
        return (
            <div {...rest} onScroll={this.onChatScroll} className={cn} ref={this.listRef}>
                {this.renderLoading()}
                {components}
                {children}
            </div>
        )
    }
}