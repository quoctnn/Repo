import * as React from 'react';
import { connect } from 'react-redux';
import ReconnectingWebSocket, { Message } from 'reconnecting-websocket';
import { ReduxState } from '../redux/index';
import { availableEndpoints } from '../redux/endpoint';
import { uniqueId, nullOrUndefined } from '../utilities/Utilities';
import { NotificationCenter } from '../utilities/NotificationCenter';
export enum EventStreamMessageType {
    STATE = "state",
    USER_UPDATE = "user.update",
    USER_ADD = "user.add",
    USER_REMOVE = "user.remove",

    CLIENT_LAST_SEEN = "client.last_seen",
    CLIENT_UPDATE = "client.update",
    CLIENT_STATUS_CHANGE = "client.status_change",
    
    CONVERSATION_TYPING = "conversation.typing",
    CONVERSATION_MESSAGE = "conversation.message",
    CONVERSATION_REMOVE = "conversation.remove",
    CONVERSATION_NEW = "conversation.new",
    CONVERSATION_UPDATE = "conversation.update",
    STATUS_NEW = "status.new",
    STATUS_UPDATE = "status.update",
    STATUS_DELETED = "status.deleted",
    STATUS_INTERACTION_UPDATE = "status.interaction.update",
    ACTIVITY_NEW = "activity.new",
    SOCKET_STATE_CHANGE = "socket.state.change",
    COMMUNITY_MAIN = "community.main",
    COMMUNITY_UPDATE = "community.update",
    COMMUNITY_DELETE = "community.delete",
    NOTIFICATIONS_UNHANDLED = "notifications.unhandled",
    FAVORITES_UPDATE = "favorites.update",

}
export const eventStreamNotificationPrefix = "eventstream_"
const socket_options = {
    maxRetries: 20,
    maxReconnectionDelay: 256000,
    minReconnectionDelay: 1000,
    reconnectionDelayGrowFactor: 6.0,
    connectionTimeout: 8000,
}
class EventQueueLock
{
    popCallback?:(object:any) => void
    didChangeLockStatus?:(locked:boolean) => void
    private eventQueue:any[] = []
    eventStreamLocks:{[id:string]:string} = {}
    constructor()
    {
        this.lock = this.lock.bind(this)
        this.unlock = this.unlock.bind(this)
        this.lockCount = this.lockCount.bind(this)
        this.popEvent = this.popEvent.bind(this)
    }
    lock()
    {
        let id = uniqueId()
        if(this.didChangeLockStatus && this.lockCount() == 0)
        {
            this.didChangeLockStatus(true)
        }
        this.eventStreamLocks[id] = id
        return id
    }
    unlock(id:string)
    {
        delete this.eventStreamLocks[id]
        if(this.didChangeLockStatus && this.lockCount() == 0)
        {
            this.didChangeLockStatus(false)
        }
    }
    lockCount()
    {
      return Object.keys(this.eventStreamLocks).length
    }
    popEvent()
    {
        return this.eventQueue.pop()
    }
    queueEvent(object:any)
    {
        this.eventQueue.unshift(object)
    }
}
export const EventLock = new EventQueueLock()
interface OwnProps
{
}
interface ReduxStateProps
{
    token?: string|null
    endpoint?: string
}
interface ReduxDispatchProps{
}
interface State
{
}
type Props = OwnProps & ReduxDispatchProps & ReduxStateProps
class ChannelEventStream extends React.Component<Props, State> {
    stream: ReconnectingWebSocket|null = null
    oldStream: ReconnectingWebSocket|null = null
    queueEvents = false
    authorized:boolean = false
    constructor(props:Props) {
        super(props)
        this.state = {
        }
        EventLock.popCallback = this.handleEventQueuePop
        EventLock.didChangeLockStatus = this.handleEventQueueLockStatusChanged
    }
    handleEventQueuePop = (event:any) =>
    {
        this.playEvent(event)
    }
    handleEventQueueLockStatusChanged = (locked:boolean) =>
    {
        this.queueEvents = locked
        var event = null
        while(!this.queueEvents && !nullOrUndefined(event = EventLock.popEvent()))
        {
            this.playEvent(event)
        }
    }
    authorize = () => {
        if (this.canSend()) {

            this.authorized = true
            let data = { type: 'authorization', data: { token: this.props.token } };
            console.log('Sending Authorization on WebSocket');
            this.stream!.send(JSON.stringify(data));
        }
    }
    canSend = () => {
        return this.stream && this.stream.readyState == ReconnectingWebSocket.OPEN;
    }
    playEvent = (event:any) =>
    {
        console.log('Message received on WebSocket',event)
        NotificationCenter.push(eventStreamNotificationPrefix + event.type,[event.data])
    }
    connectStream = () => {

        if (this.props.endpoint && (!this.stream || this.stream.readyState == ReconnectingWebSocket.CLOSED || this.stream.readyState == ReconnectingWebSocket.CLOSING) )  {
            console.log('Setting up WebSocket to', this.props.endpoint);
            this.stream = new ReconnectingWebSocket(
                this.props.endpoint,
                [],
                socket_options
            );
            this.stream.onopen = () => {
                NotificationCenter.push(eventStreamNotificationPrefix + EventStreamMessageType.SOCKET_STATE_CHANGE,[this.stream.readyState])
                console.log('WebSocket OPEN');
                (this.stream as any)._options.minReconnectionDelay = 8000
                this.sendAuthorization()
            }
            this.stream.onmessage = e => {
                let data = JSON.parse(e.data);
                if(this.queueEvents)
                {
                    EventLock.queueEvent(data)
                    console.log("queue event", data.type)
                    return
                }
                this.playEvent(data)
            }
            this.stream.onclose = event => {
                NotificationCenter.push(eventStreamNotificationPrefix + EventStreamMessageType.SOCKET_STATE_CHANGE,[this.stream.readyState])
                this.authorized = false;
                console.log('WebSocket CLOSED');
                if (this.stream && (this.stream as any)._shouldReconnect)
                    (this.stream as any)._connect();
            }
            window.app.socket = this.stream
        }
    }
    sendAuthorization = () => {
        if(!this.authorized)
        {
            this.authorize()
        }
    }
    componentDidMount = () => {
        this.connectStream()
    }
    componentDidUpdate = (prevProps:Props) =>
    {
        if(prevProps.endpoint != this.props.endpoint)
        {
            this.closeStream()
        }
        this.connectStream()
        if(prevProps.token != this.props.token)
        {
            this.authorized = false
            this.sendAuthorization()
        }
    }
    componentWillUnmount = () => {
        this.closeStream();
    }
    closeStream = () => {
        if (this.stream) {
            console.log('Discarding WebSocket');
            this.stream.close()
            this.stream = null;
            this.authorized = false
        }
    }
    render = () => {
        return null;
    }
}
const mapStateToProps = (state:ReduxState):ReduxStateProps =>
{
    const endpoint = availableEndpoints[state.endpoint.endpoint].websocket
    return {
        token:state.authentication.token,
        endpoint:endpoint
    }
};
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChannelEventStream);