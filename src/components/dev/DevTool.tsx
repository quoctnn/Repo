import * as React from "react";
import { connect } from 'react-redux'
import * as Actions from "../../actions/Actions" 
import { ApiEndpoint } from '../../reducers/debug';
import {injectIntl, InjectedIntlProps, FormattedMessage} from "react-intl";
import Intl from "../../utilities/Intl"
import { sendOnWebsocket } from '../general/ChannelEventStream';
require("./DevTool.scss");
export interface Props {
    language:number,
    availableLanguages?:Array<string>,
    setLanguage?:(index:number) => void,
    apiEndpoint?:number,
    availableApiEndpoints?:Array<ApiEndpoint>,
    setApiEndpoint?:(index:number) => void,
    accessToken?:string,
    setAccessTokenOverride:(accessToken:string) => void
    sendOnWebsocket:(data:string) => void
}

class DevTool extends React.Component<Props & InjectedIntlProps, {}> {
    state:{accessToken:string, language:number, websocketData:string}
    constructor(props) {
        super(props);
        this.state = {accessToken:this.props.accessToken, language:this.props.language, websocketData:""}
    }
    renderLanguageSelector()
    {
        return (
            
            <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {this.props.availableLanguages[this.props.language]}
                </button>

                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    {this.props.availableLanguages.map((lang, index) => {
                        return <a key={index} onClick={() => { this.props.setLanguage(index); this.setState({language:index}) }} className="dropdown-item" href="#">{lang}</a>
                    }) }
                </div>
            </div>
        )
    }
    renderEndpointSelector()
    {
        return (
            <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {this.props.availableApiEndpoints[this.props.apiEndpoint].endpoint}
                </button>

                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    {this.props.availableApiEndpoints.map((endpoint, index) => {
                        return <a key={index} onClick={() => { this.props.setApiEndpoint(index) }} className="dropdown-item" href="#">{endpoint.endpoint}</a>
                    }) }
                </div>
            </div>
        )
    }
    renderSendOnWebSocket()
    {
        return (<div className="input-group">
                    <input value={this.state.websocketData} onChange={(e) => {this.setState({websocketData:e.target.value})}}  type="text" className="form-control" placeholder="data" />
                    <div className="input-group-append">
                        <button onClick={() => {this.props.sendOnWebsocket(this.state.websocketData)}} className="btn btn-outline-secondary" type="button">{Intl.translate(this.props.intl, "Send")}</button>
                    </div>
                </div>)
    }
    renderAccessTokenInput()
    {
        return (<div className="input-group">
                    <input value={this.state.accessToken} onChange={(e) => {this.setState({accessToken:e.target.value})}}  type="text" className="form-control" placeholder="token" />
                    <div className="input-group-append">
                        <button onClick={() => {this.props.setAccessTokenOverride(this.state.accessToken)}} className="btn btn-outline-secondary" type="button">{Intl.translate(this.props.intl, "Save")}</button>
                    </div>
                </div>)
    }
    render() {
        return(
            <div id="dev-tool">
                <button id="dev-tool-button" type="button" className="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
                    <i className="fas fa-cog" />
                </button>
                <div className="modal fade" id="exampleModal" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{Intl.translate(this.props.intl, "Developer Tool")}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                        <table id="table" className="table table-hover">
                            <tbody>
                                <tr>
                                    <td data-field="key" className="key"><FormattedMessage id="Language" /></td>
                                    <td data-field="value">{this.renderLanguageSelector()}</td>
                                </tr>
                                <tr>
                                    <td data-field="key" className="key">{Intl.translate(this.props.intl, "Api Endpoint")}</td>
                                    <td data-field="value">{this.renderEndpointSelector()}</td>
                                </tr>
                                <tr>
                                    <td data-field="key" className="key">{Intl.translate(this.props.intl, "Access Token")}</td>
                                    <td data-field="value">{this.renderAccessTokenInput()}</td>
                                </tr>
                                <tr>
                                    <td data-field="key" className="key">{Intl.translate(this.props.intl, "Send WebSocket")}</td>
                                    <td data-field="value">{this.renderSendOnWebSocket()}</td>
                                </tr>
                            </tbody>
                        </table>
                        </div>
                        <div className="modal-footer">
                        </div>
                    </div>
                </div>
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        language: state.settings.language,
        availableLanguages: state.settings.availableLanguages,
        apiEndpoint:state.debug.apiEndpoint, 
        availableApiEndpoints:state.debug.availableApiEndpoints,
        accessToken:state.debug.accessToken
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        setLanguage:(index) => {
            dispatch(Actions.setLanguage(index))
        },
        setApiEndpoint:(index) => {
            dispatch(Actions.setProfile(null))
            dispatch(Actions.setSignedIn(false))
            dispatch(Actions.setApiEndpoint(index))
        },
        setAccessTokenOverride:(accessToken) => {
            dispatch(Actions.setProfile(null))
            dispatch(Actions.setSignedIn(false))
            dispatch(Actions.setAccessTokenOverride(accessToken))
        },
        sendOnWebsocket:(data:string) => 
        {
            sendOnWebsocket(data)
        }
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(DevTool));
