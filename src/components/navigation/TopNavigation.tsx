import Routes from '../../utilities/Routes';
import * as React from 'react';
import ProfileStatus from "../general/ProfileStatus";
import {Settings} from "../../utilities/Settings"
import { DevToolTrigger } from '../dev/DevToolTrigger';
import { Link} from 'react-router-dom'
import UserStatusSelector from '../general/UserStatusSelector';
import { connect } from 'react-redux'
import { RootState } from '../../reducers/index';
import { ApiEndpoint } from '../../reducers/debug';
import Button from 'reactstrap/lib/Button';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { getStream } from '../general/ChannelEventStream';
import { func } from 'prop-types';
require("./TopNavigation.scss");
export interface OwnProps
{

}
type State = {
    reconnecting: boolean;
}
interface ReduxStateProps {
    signedIn:boolean
    apiEndpoint?:number
    availableApiEndpoints?:Array<ApiEndpoint>
    stream: ReconnectingWebSocket;
}

type Props = ReduxStateProps & OwnProps
class TopNavigation extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = { reconnecting: false }
        this.enableRetryButton = this.enableRetryButton.bind(this);
        this.reconnect = this.reconnect.bind(this);
      }

    enableRetryButton() {
        this.setState({ reconnecting:false })
        if (this.props.stream)
            this.props.stream.removeEventListener("error", this.enableRetryButton)
    }

    reconnect() {
        if (this.props.stream) {
            this.setState({ reconnecting:true })
            this.props.stream.close();
            this.props.stream.reconnect();
            this.props.stream.addEventListener("error", this.enableRetryButton)
        }
    }

    render() {
        var endpoint = "";
        if (this.props.availableApiEndpoints && this.props.apiEndpoint != null) {
            endpoint = this.props.availableApiEndpoints[this.props.apiEndpoint].endpoint
            endpoint = endpoint.replace(/(^\w+:|)\/\//, '');
            endpoint = endpoint.replace(/(:\d+$)/, '');
        }
        return(
            <div id="top-navigation" className="d-flex align-items-center transition">
                <div className="flex-shrink-0">
                    <Link className="btn btn-primary margin-right-sm" to={Routes.ROOT}><i className="fas fa-home" /></Link>
                    <Link className="btn btn-primary margin-right-sm" to={Routes.CONVERSATIONS}><i className="fas fa-comments" /></Link>
                </div>
                { endpoint &&
                    <div className="text-truncate align-items-center lead">{endpoint}</div>
                }
                <div className="flex-grow-1 flex-shrink-1">
                { (this.props.stream && this.props.stream.readyState == this.props.stream.CLOSED) &&
                    <span className="text-center" style={{display:"block"}}>Reconnecting...
                        <Button disabled={this.state.reconnecting} onClick={this.reconnect}>
                            Retry
                        </Button>
                    </span>
                }
                </div>
                <div className="d-flex">
                    {!Settings.isProduction && <DevToolTrigger /> }
                    {this.props.signedIn && <UserStatusSelector /> }
                    <ProfileStatus />
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {
    return {
        signedIn:state.auth.signedIn,
        apiEndpoint: state.debug.apiEndpoint,
        availableApiEndpoints: state.debug.availableApiEndpoints,
        stream: getStream()
    }
  }
  export default connect<ReduxStateProps, void, OwnProps>(mapStateToProps, null)(TopNavigation);