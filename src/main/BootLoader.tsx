import * as React from "react";
import { connect } from 'react-redux'
import { ApiEndpoint } from '../reducers/debug';
import { Settings } from "../utilities/Settings";
import { AjaxRequest } from '../network/AjaxRequest';

export interface Props {
    rehydrated:boolean,
    availableApiEndpoints?:Array<ApiEndpoint>,
    accessToken?:string,
    apiEndpoint?:number,
    language:number,
    signedIn:boolean
}
export interface State {
    token:string,
}
class BootLoader extends React.Component<Props, {}> {

    state:State
    constructor(props) {
        super(props);
        this.state = {token:null}
        this.getCurrentToken = this.getCurrentToken.bind(this)
        this.updateTokenState = this.updateTokenState.bind(this)
    }
    componentDidMount()
    {
        this.updateTokenState()
    }
    componentDidUpdate()
    {
        this.updateTokenState()
    }
    updateTokenState()
    {
        let token = this.getCurrentToken()
        if(this.state.token != token)
        {
            Settings.accessToken = token
            AjaxRequest.setup(token)
            this.setState({token:token})
        }
    }
    getCurrentToken()
    {
        return this.props.accessToken || this.props.availableApiEndpoints[this.props.apiEndpoint].token
    }
    render() 
    {
        return null
    }
}

const mapStateToProps = (state) => {
    return {
        rehydrated:state._persist.rehydrated,
        apiEndpoint:state.debug.apiEndpoint, 
        availableApiEndpoints:state.debug.availableApiEndpoints,
        accessToken:state.debug.accessToken,
        language: state.settings.language,
        signedIn:state.auth.signedIn
    };
}
export default connect(mapStateToProps, null)(BootLoader);