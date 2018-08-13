
import * as React from "react";
import { connect } from 'react-redux'
import { ApiEndpoint } from '../../reducers/debug';
import * as SockJS from "sockjs-client";

export interface Props {
    name: 'something',
    maxReconnect: 5,
    apiEndpoint?:number,
    availableApiEndpoints?:Array<ApiEndpoint>,
    signedIn:boolean
}
class ChannelEventStream extends React.Component<Props, {}> {
    stream: any
    constructor(props) {
        super(props);
        this.closeStream = this.closeStream.bind(this)
        this.connectStream = this.connectStream.bind(this)
    }
    connectStream()
    {
        this.closeStream()
        let url = this.props.availableApiEndpoints[this.props.apiEndpoint].websocket
        if(url)
        {   
            console.log("Setting up ChannelEventStream")
            this.stream  = new WebSocket(url);
            this.stream.onopen = () => {
                console.log('open');
                this.stream.send('test');
            }
            this.stream.onmessage = (e) => {
                console.log('message', e.data);
                this.stream.close();
            }
            this.stream.onclose = () => {
                console.log('close');
            }
        }
    }
    componentDidMount()
    {
        this.connectStream()
    }
    componentWillUnmount()
    {
        this.closeStream()
    }
    closeStream()
    {
        if(this.stream)
        {
            console.log("Closing ChannelEventStream")
            this.stream.close()
            this.stream = null
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
        signedIn:state.settings.signedIn
    };
}
export default connect(mapStateToProps, null)(ChannelEventStream);