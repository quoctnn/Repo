import * as React from 'react';
import { connect } from 'react-redux';
import { ApiEndpoint } from '../../reducers/debug';
import * as Actions from '../../actions/Actions';
import { UserProfile, UserStatus } from '../../reducers/profileStore';
import { Settings } from '../../utilities/Settings';
import { AjaxRequest } from '../../network/AjaxRequest';
import { Community } from '../../reducers/communityStore';
import { RootReducer } from '../../reducers/index';
import ReconnectingWebSocket from 'reconnecting-websocket';

import { toast } from 'react-toastify';
import { ErrorToast, InfoToast } from '../../components/general/Toast';
import { Queue } from '../../reducers/queue';
import { Message, Conversation } from '../../reducers/conversations';
import { Routes } from '../../utilities/Routes';
import { History } from 'history';
import { translate } from '../intl/AutoIntlProvider';
import { sortConversations } from '../../main/App';

export enum SocketMessageType {
  STATE = "state",
  USER_UPDATE = "user.update",
  CLIENT_STATUS_CHANGE = "client.status_change",
  CONVERSATION_TYPING = "conversation.typing",
  CONVERSATION_MESSAGE = "conversation.message",
  CONVERSATION_NEW = "conversation.new"
}

export interface Props {
  apiEndpoint?: number;
  availableApiEndpoints?: Array<ApiEndpoint>;
  setProfile: (profile: UserProfile) => void;
  setSignedIn: (signedIn: boolean) => void;
  insertChatMessage:(conversation:number, message:Message) => void
  insertConversation:(conversation:Conversation) => void

  storeProfiles: (profiles: UserProfile[]) => void;
  storeProfile: (profile: UserProfile) => void;
  storeCommunities: (communities: Community[]) => void;
  storeCommunity: (community: Community) => void;
  setContactListCache: (contacts: number[]) => void;
  setAwayTimeout: (timeout: number) => void;
  updateConversationUnreadMessages:(conversation:number, unread_messages:number[]) => void

  accessToken?: string;
  signedIn: boolean;
  profile: UserProfile;
  awayTimeout: number;
  contacts: UserProfile[];
  history: History;

  queue: Queue;
  queueRemoveChatMessage: (message: Message) => void;
}
enum WebsocketState {
  CONNECTING = 0,
  OPEN,
  CLOSING,
  CLOSED
}
var publicStream: ReconnectingWebSocket = null;
export const sendOnWebsocket = (data: string) => {
  if (publicStream && publicStream.readyState == WebsocketState.OPEN) {
    console.log('Sending Websocket', data);
    publicStream.send(data);
  }
};
export const sendUserStatus = (status: UserStatus) => {
  sendOnWebsocket(
    JSON.stringify({
      type: SocketMessageType.USER_UPDATE,
      data: { status: status }
    })
  );
};
export const sendTypingInConversation = (conversation: number) => {
  sendOnWebsocket(
    JSON.stringify({
      type: SocketMessageType.CONVERSATION_TYPING,
      data: { conversation: conversation }
    })
  );
};
export const sendMessageToConversation = (
  conversation: number,
  text: string,
  uid: string,
  mentions:number[]
) => {
  sendOnWebsocket(
    JSON.stringify({
      type: SocketMessageType.CONVERSATION_MESSAGE,
      data: { conversation: conversation, text: text, uid: uid, mentions }
    })
  );
};

export const addSocketEventListener = (
  type: SocketMessageType,
  listener: EventListenerOrEventListenerObject
) => {
  document.getElementById('socket').addEventListener(type, listener);
};
export const removeSocketEventListener = (
  type: SocketMessageType,
  listener: EventListenerOrEventListenerObject
) => {
  document.getElementById('socket').removeEventListener(type, listener);
};
const socket_options = {
  connectionTimeout: 4000,
  maxRetries: 10
};
class ChannelEventStream extends React.Component<Props, {}> {
  stream: ReconnectingWebSocket;
  lastUserActivity: Date;
  lastUserActivityTimer: NodeJS.Timer;
  state: { token: string; endpoint: string };
  private socketRef = React.createRef<HTMLDivElement>();
  constructor(props) {
    super(props);
    this.state = { token: null, endpoint: null };

    this.closeStream = this.closeStream.bind(this);
    this.connectStream = this.connectStream.bind(this);
    this.connectStream = this.connectStream.bind(this);
    this.canSend = this.canSend.bind(this);
    this.authorize = this.authorize.bind(this);
    this.processStateResponse = this.processStateResponse.bind(this);
    this.getCurrentToken = this.getCurrentToken.bind(this);
    this.checkState = this.checkState.bind(this);
    
    this.processStatusChangeResponse = this.processStatusChangeResponse.bind(
      this
    );
    this.resetUserActivity = this.resetUserActivity.bind(this);
    this.lastUserActivityTimerExpired = this.lastUserActivityTimerExpired.bind(
      this
    );
    this.clearUserActivityTimer = this.clearUserActivityTimer.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.processTempQueue = this.processTempQueue.bind(this);

    this.sendMessageNotification = this.sendMessageNotification.bind(this);

    this.lastUserActivity = new Date();
    this.lastUserActivityTimer = null;
  }
  authorize() {
    if (this.canSend()) {
      let data = { type: 'authorization', data: { token: this.state.token } };
      console.log('Sending Authorization on WebSocket', data);
      this.stream.send(JSON.stringify(data));
    }
  }
  sendUserLastSeen() {
    if (this.canSend()) {
      let endTime = new Date();
      var timeDiff = endTime.getTime() - this.lastUserActivity.getTime();
      timeDiff = timeDiff / 1000;
      var seconds = Math.round(timeDiff);
      let data = { type: 'user.last_seen', data: { seconds: seconds } };
      console.log('Sending User Last Seen on WebSocket', data);
      this.stream.send(JSON.stringify(data));
    }
  }
  canSend() {
    return this.stream && this.stream.readyState == WebsocketState.OPEN;
  }
  processStateResponse(state: any) {
    let contacts: UserProfile[] = state.contacts || [];
    this.props.storeProfiles(contacts);
    this.props.setContactListCache(contacts.map(i => i.id));
    this.props.storeCommunities(state.communities || []);
    this.props.setProfile(state.user || null);
    this.props.setSignedIn(state.user != null);
    this.processTempQueue();
    if (state.away_timeout && Number.isInteger(state.away_timeout))
      this.props.setAwayTimeout(state.away_timeout);
  }
  processUserUpdateResponse(user: UserProfile) {
    this.props.storeProfile(user);
  }
  processStatusChangeResponse(data: any) {
    if (data.status == UserStatus.USER_UNAVAILABLE) {
      this.sendUserLastSeen();
    } else {
      this.sendUserLastSeen();
      let p = Object.assign({}, this.props.profile); //clone
      p.user_status = data.status;
      this.props.setProfile(p);
    }
  }
  sendMessageNotification(message: Message) {
    let uri = Routes.CONVERSATION + message.conversation;
    if (document.hasFocus()) {
      // If tab is focused
      let user: UserProfile = this.props.contacts['byId'][message.user];
      // Show the toast if the user is not viewing that conversation
      if (user && window.location.pathname != uri) {
        toast.info(
          <InfoToast message={user.first_name + ': ' + message.text} />
        );
      }
    } else if (
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      // If window is not active and notifications are enabled
      if (Notification.permission === 'granted') {
        let user: UserProfile = this.props.contacts['byId'][message.user];
        if (user) {
          var options = {
            body: user.first_name + ': ' + message.text,
            tag: 'conversation_' + message.conversation
          };
          var notification = (new Notification(
            translate('New Message'),
            options
          ).onclick = function(event) {
            window.open(uri);
          });
        }
      }
    }
  }
  processTypingInConversation(data: any) {
    var event = new CustomEvent(SocketMessageType.CONVERSATION_TYPING, {
      detail: data
    });
    this.socketRef.current.dispatchEvent(event);
  }
  processIncomingConversationMessage(data: any, unread_messages:number[]) {
    var event = new CustomEvent(SocketMessageType.CONVERSATION_MESSAGE, {
      detail: data
    });
    let message = data as Message;
    if (message.user == this.props.profile.id) {
      this.props.queueRemoveChatMessage(message);
    } else {
      this.sendMessageNotification(message);
    }
    //ensureConversationExists(message.conversation)
    this.props.insertChatMessage(message.conversation, message)
    this.props.updateConversationUnreadMessages(message.conversation, unread_messages)
    sortConversations()
    this.socketRef.current.dispatchEvent(event);
  }
  processIncomingNewConversation(data:any) 
  {
    let conversation = data as Conversation;
    this.props.insertConversation(conversation)
  }
  processTempQueue() {
    if (this.canSend()) {
      if (this.props.queue.chatMessages.length > 0) {
        this.props.queue.chatMessages.forEach(m => {
          sendMessageToConversation(m.conversation, m.text, m.uid, m.mentions);
        });
      }
    }
  }
  connectStream() {
    this.closeStream();
    if (this.state.endpoint) {
      console.log('Setting up WebSocket');
      this.stream = new ReconnectingWebSocket(
        this.state.endpoint,
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
        console.log('Message received on WebSocket', data);
        switch (data.type) {
          case SocketMessageType.STATE:
            this.processStateResponse(data.data);
            break;
          case SocketMessageType.USER_UPDATE:
            this.processUserUpdateResponse(data.data);
            break;
          case SocketMessageType.CLIENT_STATUS_CHANGE:
            this.processStatusChangeResponse(data.data);
            break;
          case SocketMessageType.CONVERSATION_TYPING:
            this.processTypingInConversation(data.data);
            break;
          case SocketMessageType.CONVERSATION_MESSAGE:
            this.processIncomingConversationMessage(data.data, data.unread_messages);
            break;
          case SocketMessageType.CONVERSATION_NEW:
            this.processIncomingNewConversation(data.data);
            break;
          default:
            console.log('NO HANDLER FOR TYPE ' + data.type);
        }
      };
      this.stream.onclose = event => {
        if (!event.wasClean)
          toast.error(
            <ErrorToast message="WebSocket closed, please refresh browser" />,
            { hideProgressBar: true }
          );
        console.log('WebSocket CLOSED');
        if ((this.stream as any)._shouldReconnect)
          (this.stream as any)._connect();
      };
    }
  }
  lastUserActivityTimerExpired() {
    this.clearUserActivityTimer();
    sendUserStatus(UserStatus.USER_AWAY);
  }
  clearUserActivityTimer() {
    if (this.lastUserActivityTimer) {
      console.log('clear timer');
      clearTimeout(this.lastUserActivityTimer);
      this.lastUserActivityTimer = null;
    }
  }
  resetUserActivity() {
    if (this.props.profile) {
      if (this.props.profile.user_status == UserStatus.USER_AWAY) {
        sendUserStatus(UserStatus.USER_ACTIVE);
        this.startTimer();
      } else if (this.props.profile.user_status == UserStatus.USER_ACTIVE) {
        this.startTimer();
      }
    }
  }
  startTimer() {
    this.clearUserActivityTimer();
    this.lastUserActivity = new Date();
    this.lastUserActivityTimer = setTimeout(
      this.lastUserActivityTimerExpired,
      this.props.awayTimeout * 1000
    );
    console.log('Setting up timeout to ' + this.props.awayTimeout);
  }
  removeActivityHandlers() {
    document.removeEventListener('mousedown', this.resetUserActivity);
    window.removeEventListener('focus', this.resetUserActivity);
    console.log('removing activity handlers');
  }
  addActivityHandlers() {
    console.log('adding activity handlers');
    document.addEventListener('mousedown', this.resetUserActivity);
    window.addEventListener('focus', this.resetUserActivity);
  }
  componentDidMount() {
    this.resetUserActivity();
    this.checkState();
  }
  componentWillUnmount() {
    this.closeStream();
  }
  componentDidUpdate(prevProps: Props) {
    this.checkState();
    if (!prevProps.profile && this.props.profile) {
      // just signed in
      if (this.props.profile.user_status == UserStatus.USER_ACTIVE) {
        this.addActivityHandlers();
        this.startTimer();
      }
    } else if (this.props.profile) {
      // profile updated
      if (this.props.profile.user_status != prevProps.profile.user_status) {
        //status changed
        if (this.props.profile.user_status == UserStatus.USER_ACTIVE) {
          this.addActivityHandlers();
          this.startTimer();
        } else if (this.props.profile.user_status == UserStatus.USER_AWAY) {
          this.clearUserActivityTimer();
        } else {
          this.removeActivityHandlers();
          this.clearUserActivityTimer();
        }
      }
    } else if (!this.props.profile) {
      // signed out
      this.removeActivityHandlers();
      this.clearUserActivityTimer();
    }
  }
  checkState() {
    var update = {};
    let token = this.getCurrentToken();
    let endpoint = this.props.availableApiEndpoints[this.props.apiEndpoint]
      .websocket;
    var updateFunc: () => void = null;
    if (this.state.token != token) {
      Settings.accessToken = token;
      AjaxRequest.setup(token);
      update['token'] = token;
      updateFunc = this.authorize;
    }
    if (this.state.endpoint != endpoint) {
      update['endpoint'] = endpoint;
      updateFunc = this.connectStream;
    }
    if (updateFunc) {
      this.setState(update, updateFunc);
    }
  }
  getCurrentToken() {
    return (
      this.props.accessToken ||
      this.props.availableApiEndpoints[this.props.apiEndpoint].token
    );
  }
  closeStream() {
    if (this.stream) {
      console.log('Closing WebSocket');
      this.stream.close();
      this.stream = null;
      publicStream = null;
    }
  }
  render() {
    return <div id="socket" ref={this.socketRef} />;
  }
}
const mapStateToProps = (state: RootReducer) => {
  return {
    availableApiEndpoints: state.debug.availableApiEndpoints,
    rehydrated: state._persist.rehydrated,
    accessToken: state.debug.accessToken,
    signedIn: state.auth.signedIn,
    apiEndpoint: state.debug.apiEndpoint,
    profile: state.profile,
    contacts: state.profileStore,
    awayTimeout: state.settings.awayTimeout,
    queue: state.queue,
    conversations:state.conversations.items
  };
};
const mapDispatchToProps = dispatch => {
  return {
    setProfile: (profile: UserProfile) => {
      dispatch(Actions.setProfile(profile));
    },
    setSignedIn: (signedIn: boolean) => {
      dispatch(Actions.setSignedIn(signedIn));
    },
    storeProfiles: (profiles: UserProfile[]) => {
      dispatch(Actions.storeProfiles(profiles));
    },
    storeProfile: (contact: UserProfile) => {
      dispatch(Actions.storeProfile(contact));
    },
    storeCommunities: (communities: Community[]) => {
      dispatch(Actions.storeCommunities(communities));
    },
    storeCommunity: (community: Community) => {
      dispatch(Actions.storeCommunity(community));
    },
    setContactListCache: (contacts: number[]) => {
      dispatch(Actions.setContactListCache(contacts));
    },
    setAwayTimeout: (timeout: number) => {
      dispatch(Actions.setAwayTimeout(timeout));
    },
    queueRemoveChatMessage: (message: Message) => {
      dispatch(Actions.queueRemoveChatMessage(message));
    },
    insertChatMessage:(conversation:number, message:Message) => {
        dispatch(Actions.insertChatMessage(conversation.toString(), message))
    },
    insertConversation:(conversation:Conversation) => {
      dispatch(Actions.insertConversation(conversation))
    },
    updateConversationUnreadMessages:(conversation:number, unread_messages:number[]) => {
      dispatch(Actions.updateConversationUnreadMessages(conversation, unread_messages))
    }
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChannelEventStream);
