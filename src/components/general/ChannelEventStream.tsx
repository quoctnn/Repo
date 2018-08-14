
import * as React from "react";
import { connect } from 'react-redux'
import { ApiEndpoint } from '../../reducers/debug';

export interface Props {
    apiEndpoint?:number,
    availableApiEndpoints?:Array<ApiEndpoint>,
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
        this.closeStream = this.closeStream.bind(this)
        this.connectStream = this.connectStream.bind(this)
        this.connectStream = this.connectStream.bind(this)
        this.canSend = this.canSend.bind(this)
        this.authorize = this.authorize.bind(this)
        this.state = {token:null, endpoint:null}
    }
    authorize()
    {
        if(this.canSend())
        {
            console.log("Sending Authorization on WebSocket")
            this.stream.send(JSON.stringify( {authorization:{token:this.state.token}}))
        }
    }
    canSend()
    {
        return this.stream && this.stream.readyState == WebsocketState.OPEN
    }
    connectStream()
    {
        this.closeStream()
        if(this.state.endpoint && this.state.token)
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
                console.log('Message received on WebSocket', JSON.parse(e.data));
            }
            this.stream.onclose = () => {
                console.log("WebSocket CLOSED");
            }
        }
    }
    componentDidMount()
    {
        let endpoint = this.props.availableApiEndpoints[this.props.apiEndpoint]
        this.setState({token:endpoint.token, endpoint:endpoint.websocket}, this.connectStream)
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
    };
}
export default connect(mapStateToProps, null)(ChannelEventStream);