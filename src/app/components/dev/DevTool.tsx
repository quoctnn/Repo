import * as React from "react";
import { connect } from "react-redux";
import { Form, Popover, PopoverBody } from "reactstrap";
import "./DevTool.scss"
import { translate } from "../../localization/AutoIntlProvider";
import { availableLanguages, setLanguageAction } from "../../redux/language";
import { availableThemes } from "../../redux/theme";
import { ReduxState } from "../../redux";
import { availableEndpoints, setEndpointAction } from "../../redux/endpoint";
import { AuthenticationManager } from "../../managers/AuthenticationManager";
import { parseJSONObject } from "../../utilities/Utilities";
import * as websocketInfo from "../../../../docs/Websocket messages.json"
import { ThemeManager } from "../../managers/ThemeManager";
import { ApplicationManager } from '../../managers/ApplicationManager';
import { WindowAppManager } from '../../managers/WindowAppManager';
import Popper from "popper.js";

type ReduxStateProps = {
    language: number;
    theme: number;
    apiEndpoint?: number;
    accessToken?: string;
}
type ReduxDispatchProps = {
    setLanguage?: (index: number) => void;
    setApiEndpoint?: (index: number) => void;
    setAccessTokenOverride: (accessToken: string) => void;
    enablePushNotifications: () => void;
}
type OwnProps = {
    showTitle?:boolean
}
type State = {
    accessToken: string;
    websocketData: string;
    websocketInboundData: string;
    dialogVisible:boolean
    info:string
    infoTarget:HTMLElement
}
type Props = OwnProps & ReduxStateProps & ReduxDispatchProps
class DevTool extends React.PureComponent<Props, State> {
    static defaultProps:OwnProps = {
        showTitle:true
    }
    constructor(props) {
        super(props);
        this.state = {
        accessToken: this.props.accessToken,
        websocketData: "",
        websocketInboundData:"",
        dialogVisible:false,
        info:undefined,
        infoTarget:undefined
        };
    }
    componentDidMount()
    {
    }
    renderThemeSelector() {
        return (
        <div className="dropdown">
            <button
            className="btn btn-secondary dropdown-toggle text-truncate"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
            >
            {availableThemes[this.props.theme].name}
            </button>

            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            {availableThemes.map((theme, index) => {
                return (
                <a
                    key={index}
                    onClick={() => {
                        ThemeManager.setTheme(index)
                    }}
                    className="dropdown-item"
                    href="#"
                >
                    {theme.name}
                </a>
                );
            })}
            </div>
        </div>
        );
    }
    renderLanguageSelector() {
        return (
        <div className="dropdown">
            <button
            className="btn btn-secondary dropdown-toggle text-truncate"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
            >
            {availableLanguages[this.props.language]}
            </button>

            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            {availableLanguages.map((lang, index) => {
                return (
                <a
                    key={index}
                    onClick={() => {
                    this.props.setLanguage(index);
                    }}
                    className="dropdown-item"
                    href="#"
                >
                    {lang}
                </a>
                );
            })}
            </div>
        </div>
        );
    }
    hideInfoBox = () => {
        this.setState({info:undefined, infoTarget:undefined})
    }
    renderInfoBox = () =>
    {
        const data = this.state.info
        const target = this.state.infoTarget
        if (!data || !target)
        {
            return null
        }
        const modifiers:Popper.Modifiers = {
            flip: { behavior: ['bottom', 'top', 'bottom'] }
          }
        return <Popover modifiers={modifiers} className="dev-tool-infoBox-container" trigger="legacy" placement="top" hideArrow={false} isOpen={!!data} target={target} toggle={this.hideInfoBox}>
                    <PopoverBody className="dev-tool-infoBox">
                        {data}
                    </PopoverBody>
                </Popover>
    }
    renderEndpointSelector() {
        return (
        <div className="dropdown">
            <button
            className="btn btn-secondary dropdown-toggle text-truncate"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
            >
            { availableEndpoints[this.props.apiEndpoint].endpoint}
            </button>

            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            {availableEndpoints.map((endpoint, index) => {
                return (
                <a
                    key={index}
                    onClick={() => {
                    this.props.setApiEndpoint(index);
                    }}
                    className="dropdown-item"
                    href="#"
                >
                    {endpoint.endpoint}
                </a>
                );
            })}
            </div>
        </div>
        );
    }

    renderSendOnWebSocket() {
        return (
        <>
            <div className="input-group">
                <input
                    value={this.state.websocketData}
                    onChange={e => {
                        this.setState({ websocketData: e.target.value });
                    }}
                    type="text"
                    className="form-control"
                    placeholder="data"
                />
                <div className="input-group-append">
                    <button
                        onClick={() => {
                            WindowAppManager.sendOutgoingOnSocket(this.state.websocketData)
                        }}
                        className="btn btn-outline-secondary"
                        type="button"
                    >
                        {translate("Send")}
                    </button>
                </div>
                </div>
            <i className="fas fa-info-circle" onClick={this.setInboundSocketInfo}></i>
        </>
        );
    }
    setInboundSocketInfo = (e:React.SyntheticEvent<any>) => {
        this.setState({info:JSON.stringify( websocketInfo ), infoTarget:e.currentTarget})
    }
    renderSendInboundOnWebSocket = () => {
        return (
            <>
                <div className="input-group">
                    <input
                        value={this.state.websocketInboundData}
                        onChange={e => {
                            this.setState({ websocketInboundData: e.target.value });
                        }}
                        type="text"
                        className="form-control"
                        placeholder="data"
                    />
                    <div className="input-group-append">
                        <button
                            onClick={() => {
                                const data = this.state.websocketInboundData
                                const object = parseJSONObject(data)
                                window.app.sendInboundOnSocket(object)
                            }}
                            className="btn btn-outline-secondary"
                            type="button"
                        >
                            {translate("Send")}
                        </button>
                    </div>
                </div>
            <i className="fas fa-info-circle" onClick={this.setInboundSocketInfo}></i>
        </>
        );
    }
    renderAccessTokenInput() {
        return (
        <div className="input-group">
            <input
            value={this.state.accessToken || ""}
            onChange={e => {
                this.setState({ accessToken: e.target.value });
            }}
            type="text"
            className="form-control"
            placeholder="token"
            />
            <div className="input-group-append">
            <button
                onClick={() => {
                this.props.setAccessTokenOverride(this.state.accessToken);
                }}
                className="btn btn-outline-secondary"
                type="button"
            >
                {translate("Save")}
            </button>
            </div>
        </div>
        );
    }
    renderClearStoreSoftButton() {
        return (
        <div className="input-group">
            <button
            onClick={() => {
                ApplicationManager.softReset()
            }}
            className="btn btn-outline-secondary"
            type="button"
            >
            {translate("Clear")}
            </button>
        </div>
        );
    }
    renderClearStoreHardButton() {
        return (
        <div className="input-group">
            <button
            onClick={() => {
                ApplicationManager.hardReset()
            }}
            className="btn btn-outline-secondary"
            type="button"
            >
            {translate("Clear")}
            </button>
        </div>
        );
    }
    renderEnablePush() {
        // Check if push is available and not already set to granted
        // and check if browser has blocked this domain from using notifications
        let disabled = !("Notification" in window);
        let blocked = false;
        if (!disabled) {
        disabled = Notification.permission === "granted";
        blocked = Notification.permission === "denied";
        }
        return (
        <div className="input-group">
            <button
            onClick={() => {
                this.props.enablePushNotifications();
            }}
            className="btn btn-outline-secondary"
            type="button"
            disabled={disabled || blocked}
            >
            {(!blocked && translate("Enable")) || translate("Blocked by browser")}
            </button>
        </div>
        );
    }
    render() {
        return (
        <div id="dev-tool">
            <div className="jumbotron">
            {this.props.showTitle && <h1 className="display-4 text-truncate">{translate("admin.developertool")}</h1>}
            <div>
                <Form>
                <div className="form-group row">
                    <label htmlFor="lang" className="col-sm-4 col-form-label">
                    {translate("Theme")}
                    </label>
                    <div className="col-sm-8" id="lang">
                    {this.renderThemeSelector()}
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="lang" className="col-sm-4 col-form-label">
                    {translate("Language")}
                    </label>
                    <div className="col-sm-8" id="lang">
                    {this.renderLanguageSelector()}
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="clearStore" className="col-sm-4 col-form-label">
                    {translate("common.reset.soft")}
                    </label>
                    <div className="col-sm-8" id="clearStore">
                    {this.renderClearStoreSoftButton()}
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="clearStore" className="col-sm-4 col-form-label">
                    {translate("common.reset.hard")}
                    </label>
                    <div className="col-sm-8" id="clearStore">
                    {this.renderClearStoreHardButton()}
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="allowPush" className="col-sm-4 col-form-label">
                    {translate("Enable Push Notifications")}
                    </label>
                    <div className="col-sm-8" id="allowPush">
                    {this.renderEnablePush()}
                    </div>
                </div>
                </Form>
            </div>
            </div>
            {this.renderInfoBox()}
        </div>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        language: state.language.language,
        apiEndpoint: state.endpoint.endpoint,
        accessToken: state.authentication.token,
        theme: state.theme.theme
    };
};
const mapDispatchToProps = dispatch => {
    return {
        setLanguage:(index:number) => {
            dispatch(setLanguageAction(index));
        },
        setApiEndpoint: (index:number) => {

            AuthenticationManager.signOut()
            dispatch(setEndpointAction(index));
        },
        setAccessTokenOverride: (accessToken:string) => {
            AuthenticationManager.signOut()
            AuthenticationManager.signIn(accessToken)
        },
        enablePushNotifications: () => {
            Notification.requestPermission();
        }
    };
}
export default connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(DevTool);
