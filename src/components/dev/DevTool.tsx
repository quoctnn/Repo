import { translate } from '../intl/AutoIntlProvider';
import * as React from 'react';
import { connect } from 'react-redux'
import * as Actions from '../../actions/Actions'; 
import { ApiEndpoint } from '../../reducers/debug';
import { sendOnWebsocket } from '../general/ChannelEventStream';
import { Button, Input , Form , FormGroup, Label} from 'reactstrap';
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

class DevTool extends React.PureComponent<Props, {}> {
    state:{accessToken:string, language:number, websocketData:string}
    constructor(props) {
        super(props);
        this.state = {accessToken:this.props.accessToken, language:this.props.language, websocketData:""}
    }
    renderLanguageSelector()
    {
        return (
            
            <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle text-truncate" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
                <button className="btn btn-secondary dropdown-toggle text-truncate" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
                        <button onClick={() => {this.props.sendOnWebsocket(this.state.websocketData)}} className="btn btn-outline-secondary" type="button">{translate("Send")}</button>
                    </div>
                </div>)
    }
    renderAccessTokenInput()
    {
        return (<div className="input-group">
                    <input value={this.state.accessToken} onChange={(e) => {this.setState({accessToken:e.target.value})}}  type="text" className="form-control" placeholder="token" />
                    <div className="input-group-append">
                        <button onClick={() => {this.props.setAccessTokenOverride(this.state.accessToken)}} className="btn btn-outline-secondary" type="button">{translate("Save")}</button>
                    </div>
                </div>)
    }
    render() {
        return(
            <div id="dev-tool">
                <div className="jumbotron">
                    <h1 className="display-4">{translate("Developer Tool")}</h1>
                    <div>
                        <Form>
                            <div className="form-group row">
                                <label htmlFor="lang" className="col-sm-3 col-form-label">{translate("Language")}</label>
                                <div className="col-sm-9" id="lang">
                                    {this.renderLanguageSelector()}
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="api" className="col-sm-3 col-form-label">{translate("Api Endpoint")}</label>
                                <div className="col-sm-9" id="api">
                                    {this.renderEndpointSelector()}
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="accessToken" className="col-sm-3 col-form-label">{translate("Access Token")}</label>
                                <div className="col-sm-9" id="accessToken">
                                    {this.renderAccessTokenInput()}
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="sendSocket" className="col-sm-3 col-form-label">{translate("Send WebSocket")}</label>
                                <div className="col-sm-9" id="sendSocket">
                                    {this.renderSendOnWebSocket()}
                                </div>
                            </div>
                        </Form>
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
            dispatch(Actions.resetCommunityStore())
            dispatch(Actions.resetGroupStore())
            dispatch(Actions.resetCommunityGroupsCache())
            dispatch(Actions.setApiEndpoint(index))
            dispatch(Actions.resetProfileStore());
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
export default connect(mapStateToProps, mapDispatchToProps)(DevTool);
