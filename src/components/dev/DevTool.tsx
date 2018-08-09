import * as React from "react";
import { connect } from 'react-redux'
import * as Actions from "../../actions/Actions" 
require("./DevTool.scss");


export interface Props {
    language?:number,
    availableLanguages?:Array<string>,
    setLanguage?:(index:number) => void,
    apiEndpoint?:number,
    availableApiEndpoints?:Array<string>,
    setApiEndpoint?:(index:number) => void,
    accessToken?:string,
    setAccessToken:(accessToken:string) => void
}

class DevTool extends React.Component<Props, {}> {
    accessTokenInput: React.RefObject<HTMLInputElement>
    state:{accessToken:string}
    constructor(props) {
        super(props);
        this.accessTokenInput = React.createRef()
        this.state = {accessToken:this.props.accessToken}
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
                        return <a key={index} onClick={() => { this.props.setLanguage(index) }} className="dropdown-item" href="#">{lang}</a>
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
                    {this.props.availableApiEndpoints[this.props.apiEndpoint]}
                </button>

                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    {this.props.availableApiEndpoints.map((endpoint, index) => {
                        return <a key={index} onClick={() => { this.props.setApiEndpoint(index) }} className="dropdown-item" href="#">{endpoint}</a>
                    }) }
                </div>
            </div>
        )
    }
    renderAccessTokenInput()
    {
        return (<div className="input-group">
                    <input ref={this.accessTokenInput} value={this.state.accessToken} onChange={(e) => {this.setState({accessToken:e.target.value})}}  type="text" className="form-control" placeholder="token" />
                    <div className="input-group-append">
                        <button onClick={() => {this.props.setAccessToken(this.state.accessToken)}} className="btn btn-outline-secondary" type="button">Save</button>
                    </div>
                </div>)
    }
    render() {
        return(
            <div id="dev-tool">
                <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
                    <i className="fas fa-cog" />
                </button>
                <div className="modal fade" id="exampleModal" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Dev Tool</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                        <table id="table" className="table table-hover">
                            <tbody>
                                <tr>
                                    <td data-field="key" className="key">Language</td>
                                    <td data-field="value">{this.renderLanguageSelector()}</td>
                                </tr>
                                <tr>
                                    <td data-field="key" className="key">Api Endpoint</td>
                                    <td data-field="value">{this.renderEndpointSelector()}</td>
                                </tr>
                                <tr>
                                    <td data-field="key" className="key">Access Token</td>
                                    <td data-field="value">{this.renderAccessTokenInput()}</td>
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
            dispatch(Actions.setApiEndpoint(index))
        },
        setAccessToken:(accessToken) => {
            dispatch(Actions.setAccessToken(accessToken))
        }
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(DevTool);
