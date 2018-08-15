
import * as React from "react";
import { connect } from 'react-redux'
import { ApiEndpoint } from '../../reducers/debug';
import * as Actions from "../../actions/Actions" 
import { UserProfile } from '../../reducers/contacts';
import { Settings } from "../../utilities/Settings";
import { AjaxRequest } from '../../network/AjaxRequest';

export interface Props {
    apiEndpoint?:number,
    availableApiEndpoints?:Array<ApiEndpoint>,
    setContacts:(contacts:UserProfile[]) => void,
    setProfile:(profile:UserProfile) => void,
    setSignedIn:(signedIn:boolean) => void,
    accessToken?:string,
    signedIn:boolean
}
enum WebsocketState {
    CONNECTING = 0,
    OPEN,
    CLOSING,
    CLOSED
}
var publicStream: WebSocket = null
export const sendOnWebsocket = (data:any) => {
    if(publicStream && publicStream.readyState == WebsocketState.OPEN)
        publicStream.send(data)
}
class ChannelEventStream extends React.Component<Props, {}> {
    stream: WebSocket
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
    }
    authorize()
    {
        if(this.canSend())
        {
            console.log("Sending Authorization on WebSocket", this.state.token)
            this.stream.send(JSON.stringify( {authorization:{token:this.state.token}}))
        }
    }
    canSend()
    {
        return this.stream && this.stream.readyState == WebsocketState.OPEN
    }
    processStateResponse(state:any)
    {
        this.props.setContacts(state.contacts || [])
        this.props.setProfile(state.user || null)
        this.props.setSignedIn(state.user != null)
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
                //this.stream.send(JSON.stringify( { request:"initial_state" }));
            }
            this.stream.onmessage = (e) => {
                let data = JSON.parse(e.data)
                switch(data.type)
                {
                    case "state" : this.processStateResponse(data.data); break;
                    default:console.log("NO HANDLER FOR TYPE " + data.type);
                }
                console.log('Message received on WebSocket', data );

            }
            this.stream.onclose = () => {
                console.log("WebSocket CLOSED");
            }
        }
    }
    componentDidMount()
    {
        this.checkState()
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
    componentWillUnmount()
    {
        this.closeStream()
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
        apiEndpoint:state.debug.apiEndpoint, 
        availableApiEndpoints:state.debug.availableApiEndpoints,
        rehydrated:state._persist.rehydrated,
        accessToken:state.debug.accessToken,
        signedIn:state.auth.signedIn
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        setContacts: (contacts:UserProfile[]) => {
            dispatch(Actions.setContacts(contacts));
        },
        setProfile: (profile:UserProfile) => {
            dispatch(Actions.setProfile(profile));
        },
        setSignedIn:(signedIn:boolean) => {
            dispatch(Actions.setSignedIn(signedIn))
        },
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(ChannelEventStream);