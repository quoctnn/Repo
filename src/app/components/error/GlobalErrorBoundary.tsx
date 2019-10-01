import * as React from "react";
import SimpleDialog from "../general/dialogs/SimpleDialog";
import {ApiClient} from "../../network/ApiClient";
import { CrashLogLevel } from '../../types/intrasocial_types';
import { AuthenticationManager } from "../../managers/AuthenticationManager";
import { EndpointManager } from '../../managers/EndpointManager';
import { EventSubscription } from 'fbemitter';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { NotificationCenter } from "../../utilities/NotificationCenter";
import { eventStreamNotificationPrefix, EventStreamMessageType } from "../../network/ChannelEventStream";
import "./GlobalErrorBoundary.scss"
import classnames from 'classnames';
import { translate } from '../../localization/AutoIntlProvider';
type State = {
    error:Error
    errorInfo:any
    windowError:Error
    websocket:number
    online:boolean
}
type Props = {}
export default class GlobalErrorBoundary extends React.Component<Props, State> {
    observers:EventSubscription[] = []
        constructor(props:Props) {
        super(props);
        this.state = { error: null,  errorInfo:null, windowError:null, websocket:null, online:true};
        const stateChangeObserver = NotificationCenter.addObserver(eventStreamNotificationPrefix + EventStreamMessageType.SOCKET_STATE_CHANGE, this.websocketStateChangedEvent)
        this.observers.push(stateChangeObserver)
    }
    componentDidMount = () => {
        window.addEventListener('online',  this.networkStateChangedEvent);
        window.addEventListener('offline', this.networkStateChangedEvent);
        window.addEventListener('error', this.onWindowError)
    }
    componentWillUnmount() {
        this.observers.forEach(o => o.remove())
    }
    onWindowError = (event: ErrorEvent) => {
        this.setState({ windowError:event.error })
        this.sendError(event.error)
    }
    websocketStateChangedEvent = (...args:any[]) => {
        this.setState({websocket: args[0]})
    }
    networkStateChangedEvent = () => {
        this.setState({ online: navigator.onLine })
    }
    componentDidCatch(error:Error, errorInfo:any) {
        this.setState({ error, errorInfo })
        this.sendError(error, errorInfo)
    }
    closeWindowErrorModal = () => {
        this.setState((prevState:State) => {
            return {windowError:null}
         })
    }
    renderWindowErrorModal = () => {
        const header = "Error detected!"
        return <SimpleDialog header={header} visible={!!this.state.windowError} didCancel={this.closeWindowErrorModal}>
                    {this.renderErrorPage(this.state.windowError)}
                </SimpleDialog>
    }
    sendError = (error:Error, errorInfo?:any) => {
        if(!error)
            return
        const userAgent = navigator.userAgent
        const user = AuthenticationManager.getAuthenticatedUser()
        const userId = user && user.id || -1
        const endpoint = EndpointManager.currentEndpoint().endpoint
        const extraDict = {
            language:window.app.language
        }
        const extra = JSON.stringify(extraDict)
        ApiClient.sendCrashReport(CrashLogLevel.error, error.message, error.stack, errorInfo && errorInfo.componentStack, userId, userAgent, endpoint,extra,  () => {

        })
    }
    ignoreWebSocketError = (e:React.MouseEvent) => {
        this.setState({websocket:0})
    }
    renderWebsocketError = () => {
        const classes = classnames("error-banner websocket-error",
            {active: this.state.websocket == ReconnectingWebSocket.CLOSED})
        return (
            <div className={classes}>
                <div className="text-center">
                    <h5>{translate("websocket.error.title")}</h5>
                    <h6>{translate("websocket.error.description")}</h6>
                    <button className="btn" onClick={this.ignoreWebSocketError}>{translate("common.close")}</button>
                </div>
            </div>)
    }
    renderNetworkConnectionError = () => {
        const classes = classnames("error-banner network-error",
            {active: !this.state.online})
        return (
            <div className={classes}>
                <div className="text-center">
                    <h5>{translate("network.error.title")}</h5>
                    <h6>{translate("network.error.description")}</h6>
                </div>
            </div>)
    }
    renderErrorPage = (error:Error, errorInfo?:any) => {
        if(!error)
            return null
        const compStack = errorInfo && errorInfo.componentStack
        return <div className="error-boundary m-2">
                    <div><a href="/">HOME</a></div>
                    <h2>Something went wrong.</h2>
                    <div>{error.toString()}</div>
                    {error && <details style={{ whiteSpace: 'pre-wrap' }}>
                        <summary>{"Stack"}</summary>
                        {error.stack && <div className="error-stack">{error.stack}</div>}
                    </details>}
                    {compStack && <details style={{ whiteSpace: 'pre-wrap' }}>
                        <summary>{"ComponentStack"}</summary>
                        <div className="error-stack">{compStack}</div>}
                    </details>}
                </div>
    }
    render() {
        if (this.state.error && this.state.errorInfo)
        {
                return this.renderErrorPage(this.state.error, this.state.errorInfo)
        }
        return <>
            {this.renderWindowErrorModal()}
            {this.renderNetworkConnectionError()}
            {this.renderWebsocketError()}
            {this.props.children}
            </>
    }
  }