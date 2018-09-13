import { translate } from '../intl/AutoIntlProvider';
import * as React from 'react';
import { connect } from 'react-redux';
import * as Actions from '../../actions/Actions';
import { ApiEndpoint } from '../../reducers/debug';
import { sendOnWebsocket, getStream } from '../general/ChannelEventStream';
import { Form } from 'reactstrap';
import { availableLanguages, availableThemes } from '../../reducers/settings';
import { RootReducer } from '../../reducers';
import { resetEmbedlyStore } from '../../actions/Actions';
import ReconnectingWebSocket from 'reconnecting-websocket';
require('./DevTool.scss');
export interface Props {
  language: number;
  theme: number;
  setLanguage?: (index: number) => void;
  apiEndpoint?: number;
  availableApiEndpoints?: Array<ApiEndpoint>;
  setApiEndpoint?: (index: number) => void;
  accessToken?: string;
  setAccessTokenOverride: (accessToken: string) => void;
  sendOnWebsocket: (data: string) => void;
  disableWebsocket: (state: boolean) => void;
  setTheme?: (index: number) => void;
  clearDataStore: () => void;
  enablePushNotifications: () => void;
}

class DevTool extends React.PureComponent<Props, {}> {
  stream: ReconnectingWebSocket;
  state: { accessToken: string; websocketData: string; websocketDisabled: boolean};
  constructor(props) {
    super(props);
    this.stream = getStream();
    this.state = { accessToken: this.props.accessToken, websocketData: '', websocketDisabled: false };
  }
  componentDidMount() {
    if (this.stream.readyState > 1) {
      this.setState({websocketDisabled: true})
    }
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
          {this.props.availableApiEndpoints[this.props.apiEndpoint].endpoint}
        </button>

        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {this.props.availableApiEndpoints.map((endpoint, index) => {
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
            {translate('Send')}
          </button>
        </div>
      </div>
    );
  }
  renderAccessTokenInput() {
    return (
      <div className="input-group">
        <input
          value={this.state.accessToken}
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
            {translate('Save')}
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
          {translate('Clear')}
        </button>
      </div>
    );
  }
  disableWebsocket(state: boolean) {
    if (state) {
      this.stream.close()
    } else {
      this.stream.reconnect()
    }
    this.setState({websocketDisabled: state});
  }
  renderDisableWebsocketButton() {
    return (
      <div className="input-group">
        <button
          onClick={() => {
              this.disableWebsocket(!this.state.websocketDisabled)
            }
          }
          className="btn btn-outline-secondary"
          type="button"
        >
          {this.state.websocketDisabled && translate('Enable') || translate('Disable')}
        </button>
      </div>
    );
  }
  renderEnablePush() {
    // Check if push is available and not already set to granted
    // and check if browser has blocked this domain from using notifications
    let disabled = !('Notification' in window);
    let blocked = false;
    if (!disabled) {
      disabled = Notification.permission === 'granted';
      blocked = Notification.permission === 'denied';
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
          {(!blocked && translate('Enable')) || translate('Blocked by browser')}
        </button>
      </div>
    );
  }
  render() {
    return (
      <div id="dev-tool">
        <div className="jumbotron">
          <h1 className="display-4">{translate('Developer Tool')}</h1>
          <div>
            <Form>
              <div className="form-group row">
                <label htmlFor="lang" className="col-sm-3 col-form-label">
                  {translate('Theme')}
                </label>
                <div className="col-sm-9" id="lang">
                  {this.renderThemeSelector()}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="lang" className="col-sm-3 col-form-label">
                  {translate('Language')}
                </label>
                <div className="col-sm-9" id="lang">
                  {this.renderLanguageSelector()}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="api" className="col-sm-3 col-form-label">
                  {translate('Api Endpoint')}
                </label>
                <div className="col-sm-9" id="api">
                  {this.renderEndpointSelector()}
                </div>
              </div>
              <div className="form-group row">
                <label
                  htmlFor="accessToken"
                  className="col-sm-3 col-form-label"
                >
                  {translate('Access Token')}
                </label>
                <div className="col-sm-9" id="accessToken">
                  {this.renderAccessTokenInput()}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="sendSocket" className="col-sm-3 col-form-label">
                  {translate('Send WebSocket')}
                </label>
                <div className="col-sm-9" id="sendSocket">
                  {this.renderSendOnWebSocket()}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="clearStore" className="col-sm-3 col-form-label">
                  {translate('Local Storage')}
                </label>
                <div className="col-sm-9" id="clearStore">
                  {this.renderClearStoreButton()}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="allowPush" className="col-sm-3 col-form-label">
                  {translate('Enable Push Notifications')}
                </label>
                <div className="col-sm-9" id="allowPush">
                  {this.renderEnablePush()}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="disableWebsocket" className="col-sm-3 col-form-label">
                  {translate('Websocket')}
                </label>
                <div className="col-sm-9" id="disableWebsocket">
                  {this.renderDisableWebsocketButton()}
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootReducer) => {
  return {
    language: state.settings.language,
    apiEndpoint: state.debug.apiEndpoint,
    availableApiEndpoints: state.debug.availableApiEndpoints,
    accessToken: state.debug.accessToken,
    theme: state.settings.theme
  };
};
const mapDispatchToProps = dispatch => {
  return {
    setLanguage: index => {
      dispatch(Actions.setLanguage(index));
    },
    setTheme: index => {
      dispatch(Actions.setTheme(index));
    },
    setApiEndpoint: index => {
      dispatch(Actions.setProfile(null));
      dispatch(Actions.setSignedIn(false));
      dispatch(Actions.resetCommunityStore());
      dispatch(Actions.resetGroupStore());
      dispatch(Actions.resetCommunityGroupsCache());
      dispatch(Actions.setApiEndpoint(index));
      dispatch(Actions.resetProfileStore());
    },
    setAccessTokenOverride: accessToken => {
      dispatch(Actions.setProfile(null));
      dispatch(Actions.setSignedIn(false));
      dispatch(Actions.setAccessTokenOverride(accessToken));
    },
    clearDataStore: () => {
      dispatch(Actions.resetPagedData());
      dispatch(Actions.resetEmbedlyStore());
    },
    sendOnWebsocket: (data: string) => {
      sendOnWebsocket(data);
    },
    enablePushNotifications: () => {
      Notification.requestPermission();
    }
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DevTool);
