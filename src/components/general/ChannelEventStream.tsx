import * as React from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { IntraSocialUtilities } from '../../utilities/IntraSocialUtilities';
import { nullOrUndefined } from '../../utilities/Utilities';
import { NotificationCenter } from '../../notifications/NotificationCenter';
import { connect } from 'react-redux';
import { RootState } from '../../reducers';
import { UserStatus } from '../../types/intrasocial_types';
import * as Actions from "../../actions/Actions"
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { EventStreamManager } from '../../managers/EventStreamManager';

export enum EventStreamMessageType {
  STATE = "state",
  USER_UPDATE = "user.update",
  USER_LAST_SEEN = "user.last_seen",
  CLIENT_STATUS_CHANGE = "client.status_change",
  CONVERSATION_TYPING = "conversation.typing",
  CONVERSATION_MESSAGE = "conversation.message",
  CONVERSATION_NEW = "conversation.new",
  CONVERSATION_UPDATE = "conversation.update",
  STATUS_NEW = "status.new",
  STATUS_UPDATE = "status.update",
  STATUS_DELETED = "status.deleted",
}

enum WebsocketState {
  CONNECTING = 0,
  OPEN,
  CLOSING,
  CLOSED
}
var publicStream: ReconnectingWebSocket|null = null;
export const sendOnWebsocket = (data: string) => {
  if (canSendOnWebsocket()) {
    //console.log('Sending Websocket', data);
    publicStream!.send(data);
  }
};
export const canSendOnWebsocket = () => {
  return publicStream && publicStream.readyState == WebsocketState.OPEN
};
export const getStream = () => {
  return publicStream;
}
export const sendUserStatus = (status: UserStatus) => {
  sendOnWebsocket(
    JSON.stringify({
      type: EventStreamMessageType.USER_UPDATE,
      data: { status: status }
    })
  );
}
const socket_options = {
  maxRetries: 20,
  maxReconnectionDelay: 256000,
  minReconnectionDelay: 8000,
  reconnectionDelayGrowFactor: 6.0,
  connectionTimeout: 8000,
};
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
      let id = IntraSocialUtilities.uniqueId()
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
  setDirtyPagedData:() => void
}
interface State
{
}
type Props = OwnProps & ReduxDispatchProps & ReduxStateProps
class ChannelEventStream extends React.Component<Props, State> {
  stream: ReconnectingWebSocket|null = null
  queueEvents = false
  constructor(props:Props) {
    super(props)
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
      let data = { type: 'authorization', data: { token: this.props.token } };
      console.log('Sending Authorization on WebSocket', data);
      this.stream!.send(JSON.stringify(data));
    }
  }
  canSend = () => {
    return this.stream && this.stream.readyState == WebsocketState.OPEN;
  }
  playEvent = (event:any) =>
  {
    console.log('Message received on WebSocket', event)
    NotificationCenter.push("eventstream_" + event.type,[event.data])
  }
  connectStream = () => {
    this.closeStream();
    if (this.props.endpoint) {
      console.log('Setting up WebSocket');
      this.stream = new ReconnectingWebSocket(
        this.props.endpoint,
        [],
        socket_options
      );
      publicStream = this.stream;
      this.stream.onopen = () => {
        console.log('WebSocket OPEN');
        this.authorize();
      };
      this.stream.onmessage = e => {
        let data = JSON.parse(e.data);
        if(this.queueEvents)
        {
            EventLock.queueEvent(data)
            console.log("queue event", data.type)
            return
        }
        this.playEvent(data)
      };
      this.stream.onclose = event => {
        if (!event.wasClean)
        {
          /*toast.error(
            <ErrorToast message="WebSocket closed, please refresh browser" />,
            { hideProgressBar: true }
          );*/
        }
        if(!this.stream || this.stream.retryCount == 0)
          EventStreamManager.socketDisconnected()
        AuthenticationManager.clearKeepAliveTimer()
        console.log('WebSocket CLOSED', this.stream);
        if (this.stream && (this.stream as any)._shouldReconnect)
          (this.stream as any)._connect();
      };
    }
  }
  componentDidMount = () => {
    this.updateConnection()
  }
  componentDidUpdate = (prevProps:Props) =>
  {
    if(prevProps.token && this.props.token && prevProps.token != this.props.token)
    {
      this.closeStream()
    }
    this.updateConnection()
  }
  updateConnection = () =>
  {
    const isOnline = this.canSend()
    const canConnect = !!this.props.token && !!this.props.endpoint
    if(isOnline)
    {
      if(!canConnect)
      {
        this.closeStream()
      }
    }
    else
    {
      if(canConnect)
      {
        this.connectStream()
      }
    }
  }
  componentWillUnmount = () => {
    this.closeStream();
  }
  closeStream = () => {
    if (this.stream) {
      console.log('Closing WebSocket');
      this.stream.close();
      this.stream = null;
      publicStream = null;
    }
  }
  render = () => {
    return null;
  }
}
const mapStateToProps = (state: RootState):ReduxStateProps =>
{
  const endpoint = state.debug.availableApiEndpoints[state.debug.apiEndpoint].websocket
  return {
    token:state.auth.authToken,
    endpoint:endpoint
  };
};
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
  return {
    setDirtyPagedData: () => {
        dispatch(Actions.setDirtyPagedData());
    },
};
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChannelEventStream);