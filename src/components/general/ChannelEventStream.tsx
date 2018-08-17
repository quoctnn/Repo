
import * as React from "react";
import { connect } from 'react-redux'
import { ApiEndpoint } from '../../reducers/debug';
import * as Actions from "../../actions/Actions" 
import { UserProfile, UserStatus } from '../../reducers/profileStore';
import { Settings } from "../../utilities/Settings";
import { AjaxRequest } from '../../network/AjaxRequest';
import { Community } from '../../reducers/communityStore';

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
    
    accessToken?:string,
    signedIn:boolean,
    profile:UserProfile
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
        this.handleUserActivity = this.handleUserActivity.bind(this)
        this.lastUserActivity = new Date()
        
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
    handleUserActivity()
    {
        this.lastUserActivity = new Date()
    }
    componentDidMount()
    {
        document.addEventListener('mousedown', this.handleUserActivity);
        window.addEventListener("focus", this.handleUserActivity)
        this.checkState()
    }
    componentWillUnmount()
    {
        document.removeEventListener('mousedown', this.handleUserActivity);
        window.removeEventListener("focus", this.handleUserActivity)
        this.closeStream()
    }
    componentDidUpdate()
    {
        this.checkState()
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
        profile:state.profile
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
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(ChannelEventStream);