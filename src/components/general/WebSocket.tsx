import * as React from "react";
import { connect } from "react-redux";
import { ApiEndpoint } from "../../reducers/debug";
import { Routes } from "../../utilities/Routes";
import ReconnectingEventSource from "reconnecting-eventsource";

export interface Props {
  name: "something";
  maxReconnect: 5;
  apiEndpoint?: number;
  availableApiEndpoints?: Array<ApiEndpoint>;
}
class WebSocket extends React.Component<Props, {}> {
  stream: any;
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    let domain = this.props.availableApiEndpoints[this.props.apiEndpoint]
      .endpoint;
    let url = domain + Routes.WEBSOCKET;
    this.stream = new ReconnectingEventSource(url);
    this.stream.addEventListener(
      "message",
      function(e) {
        console.log(e.data);
      },
      false
    );

    this.stream.addEventListener(
      "stream-reset",
      function(e) {
        // ... client fell behind, reinitialize ...
        console.log("... client fell behind, reinitialize ...");
      },
      false
    );
  }
  render() {
    return null;
  }
}
const mapStateToProps = state => {
  return {
    apiEndpoint: state.debug.apiEndpoint,
    availableApiEndpoints: state.debug.availableApiEndpoints
  };
};
export default connect(
  mapStateToProps,
  null
)(WebSocket);
