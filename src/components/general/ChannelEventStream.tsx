
import * as React from "react";
import { connect } from 'react-redux'
import { ApiEndpoint } from '../../reducers/debug';
import * as Actions from "../../actions/Actions" 
import { UserProfile, UserStatus } from '../../reducers/profileStore';
import { Settings } from "../../utilities/Settings";
import { AjaxRequest } from '../../network/AjaxRequest';
import { Community } from '../../reducers/communityStore';
import profile from '../../reducers/profile';

export interface Props {
    apiEndpoint?:number,
    availableApiEndpoints?:Array<ApiEndpoint>,
    setProfile:(profile:UserProfile) => void,
    setSignedIn:(signedIn:boolean) => void,

    storeProfiles:(profiles:UserProfile[]) => void,
    storeProfile:(profile:UserProfile) => void,
    storeCommunities: (communities:Community[]) => void,
    storeCommunity:(community:Community) => void,
    setContactListCache:(contacts:number[]) => void,
    setAwayTimeout:(timeout:number) => void,
    
    accessToken?:string,
    signedIn:boolean,
    profile:UserProfile,
    awayTimeout:number
}
enum WebsocketState {
    CONNECTING = 0,
    OPEN,
    CLOSING,
    CLOSED
}
var publicStream: WebSocket = null
export const sendOnWebsocket = (data:string) => {
    if(publicStream && publicStream.readyState == WebsocketState.OPEN)
    {
        console.log("Sending Websocket", data)
        publicStream.send(data)
    }
}
export const sendUserStatus = (status:UserStatus) => 
{
    sendOnWebsocket(JSON.stringify({type:"user.update", data: {status: status}}))
}
class ChannelEventStream extends React.Component<Props, {}> {
    stream: WebSocket
    lastUserActivity:Date
    lastUserActivityTimer:NodeJS.Timer
    state:{token:string, endpoint:string}
    constructor(props) {
        super(props);
        this.state = {token:null, endpoint:null}

        this.closeStream = this.closeStream.bind(this)
        this.connectStream = this.connectStream.bind(this)
        this.connectStream = this.connectStream.bind(this)
        this.canSend = this.canSend.bind(this)
        this.authorize = this.authorize.bind(this)
        this.processStateResponse = this.processStateResponse.bind(this)
        this.getCurrentToken = this.getCurrentToken.bind(this)
        this.checkState = this.checkState.bind(this)
        this.processStatusChangeResponse = this.processStatusChangeResponse.bind(this)
        this.resetUserActivity = this.resetUserActivity.bind(this)
        this.lastUserActivityTimerExpired = this.lastUserActivityTimerExpired.bind(this)
        this.clearUserActivityTimer = this.clearUserActivityTimer.bind(this)
        this.startTimer = this.startTimer.bind(this)
        
        this.lastUserActivity = new Date()
        this.lastUserActivityTimer = null
    }
    authorize()
    {
        if(this.canSend())
        {
            let data = {type:"authorization", data:{token:this.state.token}}
            console.log("Sending Authorization on WebSocket", data)
            this.stream.send(JSON.stringify( data ))
        }
    }
    sendUserLastSeen()
    {
        if(this.canSend())
        {
            let endTime = new Date()
            var timeDiff = endTime.getTime() - this.lastUserActivity.getTime()
            timeDiff = timeDiff / 1000
            var seconds = Math.round(timeDiff)
            let data = {type: "user.last_seen", data: {seconds: seconds}}
            console.log("Sending User Last Seen on WebSocket", data)
            this.stream.send(JSON.stringify( data ))
        }
    }
    canSend()
    {
        return this.stream && this.stream.readyState == WebsocketState.OPEN
    }
    processStateResponse(state:any)
    {
        let contacts:UserProfile[] = state.contacts || []
        this.props.storeProfiles(contacts)
        this.props.setContactListCache(contacts.map(i => i.id))
        this.props.storeCommunities(state.communities || [])
        this.props.setProfile(state.user || null)
        this.props.setSignedIn(state.user != null)
        if(state.away_timeout && Number.isInteger(state.away_timeout))
            this.props.setAwayTimeout(state.away_timeout)
    }
    processUserUpdateResponse(user:UserProfile)
    {
        this.props.storeProfile(user)
    }
    processStatusChangeResponse(data:any)
    {
        let p = Object.assign({}, this.props.profile)//clone
        p.user_status = data.status
        this.props.setProfile(p)
        this.sendUserLastSeen()
    }
    connectStream()
    {
        this.closeStream()
        if(this.state.endpoint)
        {   
            console.log("Setting up WebSocket")
            this.stream  = new WebSocket(this.state.endpoint);
            publicStream = this.stream
            this.stream.onopen = () => {
                console.log("WebSocket OPEN")
                this.authorize()
            }
            this.stream.onmessage = (e) => {
                let data = JSON.parse(e.data)
                console.log('Message received on WebSocket', data );
                switch(data.type)
                {
                    case "state" : this.processStateResponse(data.data); break;
                    case "user.update" : this.processUserUpdateResponse(data.data); break;
                    case "client.status_change" : this.processStatusChangeResponse(data.data); break;
                    default:console.log("NO HANDLER FOR TYPE " + data.type);
                }
            }
            this.stream.onclose = () => {
                console.log("WebSocket CLOSED");
            }
        }
    }
    lastUserActivityTimerExpired()
    {
        this.clearUserActivityTimer()
        sendUserStatus(UserStatus.USER_AWAY)
    }
    clearUserActivityTimer()
    {
        if(this.lastUserActivityTimer)
        {
            console.log("clear timer")
            clearTimeout(this.lastUserActivityTimer)
            this.lastUserActivityTimer = null
        }
    }
    resetUserActivity()
    {
        if(this.props.profile)
        {
            if(this.props.profile.user_status == UserStatus.USER_AWAY)
            {
                sendUserStatus(UserStatus.USER_ACTIVE)
                this.startTimer()
            }
            else if(this.props.profile.user_status == UserStatus.USER_ACTIVE)
            {
                this.startTimer()
            }
        }
    }
    startTimer()
    {
        this.clearUserActivityTimer()
        this.lastUserActivity = new Date()
        this.lastUserActivityTimer = setTimeout(this.lastUserActivityTimerExpired, this.props.awayTimeout * 1000)
        console.log("Setting up timeout to " + this.props.awayTimeout)
    }
    removeActivityHandlers()
    {
        document.removeEventListener('mousedown', this.resetUserActivity);
        window.removeEventListener("focus", this.resetUserActivity)
        console.log("removing activity handlers")
    }
    addActivityHandlers()
    {
        console.log("adding activity handlers")
        document.addEventListener('mousedown', this.resetUserActivity);
        window.addEventListener("focus", this.resetUserActivity)
    }
    componentDidMount()
    {
        this.resetUserActivity()
        this.checkState()
    }
    componentWillUnmount()
    {
        this.closeStream()
    }
    componentDidUpdate(prevProps:Props)
    {
        this.checkState()
        if(!prevProps.profile && this.props.profile) // just signed in
        {
            if(this.props.profile.user_status == UserStatus.USER_ACTIVE)
            {
                this.addActivityHandlers()
                this.startTimer()
            }
        }
        else if(this.props.profile) // profile updated
        {
            if(this.props.profile.user_status != prevProps.profile.user_status)//status changed
            {
                if(this.props.profile.user_status == UserStatus.USER_ACTIVE)
                {
                    this.addActivityHandlers()
                    this.startTimer()
                }
                else if(this.props.profile.user_status == UserStatus.USER_AWAY)
                {
                    this.clearUserActivityTimer()
                }
                else 
                {
                    this.removeActivityHandlers()
                    this.clearUserActivityTimer()
                }
            }
        }
        else if(!this.props.profile)  // signed out
        {
            this.removeActivityHandlers()
            this.clearUserActivityTimer()
        }
    }
    checkState()
    {
        var update = {}
        let token = this.getCurrentToken()
        let endpoint = this.props.availableApiEndpoints[this.props.apiEndpoint].websocket
        var updateFunc:() => void = null
        if(this.state.token != token)
        {
            Settings.accessToken = token
            AjaxRequest.setup(token)
            update["token"] = token
            updateFunc = this.authorize
        }
        if(this.state.endpoint != endpoint)
        {
            update["endpoint"] = endpoint
            updateFunc = this.connectStream
        }
        if(updateFunc)
        {
            this.setState(update, updateFunc)
        }
    }
    getCurrentToken()
    {
        return this.props.accessToken || this.props.availableApiEndpoints[this.props.apiEndpoint].token
    }
    closeStream()
    {
        if(this.stream)
        {
            console.log("Closing WebSocket")
            this.stream.close()
            this.stream = null
            publicStream = null
        }
    }
    render() 
    {
        return (null)
    }
}
const mapStateToProps = (state) => {
    return {
        availableApiEndpoints:state.debug.availableApiEndpoints,
        rehydrated:state._persist.rehydrated,
        accessToken:state.debug.accessToken,
        signedIn:state.auth.signedIn,
        apiEndpoint:state.debug.apiEndpoint,
        profile:state.profile,
        awayTimeout:state.settings.awayTimeout
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        setProfile: (profile:UserProfile) => {
            dispatch(Actions.setProfile(profile));
        },
        setSignedIn:(signedIn:boolean) => {
            dispatch(Actions.setSignedIn(signedIn))
        },
        storeProfiles: (profiles:UserProfile[]) => {
            dispatch(Actions.storeProfiles(profiles));
        },
        storeProfile:(contact:UserProfile) => {
            dispatch(Actions.storeProfile(contact))
        },
        storeCommunities: (communities:Community[]) => {
            dispatch(Actions.storeCommunities(communities));
        },
        storeCommunity:(community:Community) => {
            dispatch(Actions.storeCommunity(community))
        },
        setContactListCache:(contacts:number[]) => {
            dispatch(Actions.setContactListCache(contacts))
        },
        setAwayTimeout:(timeout:number) => {
            dispatch(Actions.setAwayTimeout(timeout))
        },
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(ChannelEventStream);