import * as React from "react";
import { connect } from "react-redux";
import { Form, Button } from "reactstrap";
import "./DevTool.scss"
import { translate } from "../../localization/AutoIntlProvider";
import { availableLanguages, setLanguageAction } from "../../redux/language";
import { availableThemes, setThemeAction } from "../../redux/theme";
import { sendOnWebsocket } from "../../network/ChannelEventStream";
import { ReduxState } from "../../redux";
import { availableEndpoints, setEndpointAction } from "../../redux/endpoint";
import { resetCommunitiesAction } from "../../redux/communityStore";
import { resetGroupsAction } from "../../redux/groupStore";
import { resetEventsAction } from "../../redux/eventStore";
import { resetProjectsAction } from "../../redux/projectStore";
import { resetTasksAction } from "../../redux/taskStore";
import { resetProfilesAction } from "../../redux/profileStore";
import { AuthenticationManager } from "../../managers/AuthenticationManager";
type Props = {
    language: number;
    theme: number;
    setLanguage?: (index: number) => void;
    apiEndpoint?: number;
    setApiEndpoint?: (index: number) => void;
    accessToken?: string;
    setAccessTokenOverride: (accessToken: string) => void;
    sendOnWebsocket: (data: string) => void;
    disableWebsocket: (state: boolean) => void;
    setTheme?: (index: number) => void;
    clearDataStore: () => void;
    enablePushNotifications: () => void;
}
type State = {
    accessToken: string;
    websocketData: string;
    dialogVisible:boolean
}
class DevTool extends React.PureComponent<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
        accessToken: this.props.accessToken,
        websocketData: "",
        dialogVisible:false
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
                    this.props.setTheme(index);
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
                this.props.sendOnWebsocket(this.state.websocketData);
                }}
                className="btn btn-outline-secondary"
                type="button"
            >
                {translate("Send")}
            </button>
            </div>
        </div>
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
    renderClearStoreButton() {
        return (
        <div className="input-group">
            <button
            onClick={() => {
                this.props.clearDataStore();
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
            <h1 className="display-4">{translate("Developer Tool")}</h1>
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
                    <label htmlFor="api" className="col-sm-4 col-form-label">
                    {translate("Api Endpoint")}
                    </label>
                    <div className="col-sm-8" id="api">
                    {this.renderEndpointSelector()}
                    </div>
                </div>
                <div className="form-group row">
                    <label
                    htmlFor="accessToken"
                    className="col-sm-4 col-form-label"
                    >
                    {translate("Access Token")}
                    </label>
                    <div className="col-sm-8" id="accessToken">
                    {this.renderAccessTokenInput()}
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="sendSocket" className="col-sm-4 col-form-label">
                    {translate("Send WebSocket")}
                    </label>
                    <div className="col-sm-8" id="sendSocket">
                    {this.renderSendOnWebSocket()}
                    </div>
                </div>
                <div className="form-group row">
                    <label htmlFor="clearStore" className="col-sm-4 col-form-label">
                    {translate("Local Storage")}
                    </label>
                    <div className="col-sm-8" id="clearStore">
                    {this.renderClearStoreButton()}
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
        setTheme:(index:number) => {
            dispatch(setThemeAction(index));
        },
        setApiEndpoint: (index:number) => {
            
            AuthenticationManager.signOut()
            dispatch(setEndpointAction(index));
        },
        setAccessTokenOverride: (accessToken:string) => {
            AuthenticationManager.signOut()
            AuthenticationManager.signIn(accessToken)
        },
        clearDataStore: () => {
            dispatch(resetCommunitiesAction())
            dispatch(resetGroupsAction())
            dispatch(resetProjectsAction())
            dispatch(resetEventsAction())
            dispatch(resetTasksAction())
            dispatch(resetProfilesAction())
        },
        sendOnWebsocket: (data: string) => {
            sendOnWebsocket(data);
        },
        enablePushNotifications: () => {
            Notification.requestPermission();
        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(DevTool);
