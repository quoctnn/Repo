import * as React from "react";
import SimpleDialog from "../general/dialogs/SimpleDialog";
import {ApiClient} from "../../network/ApiClient";
import { CrashLogLevel } from "../../types/intrasocial_types";
import { AuthenticationManager } from "../../managers/AuthenticationManager";
import { EndpointManager } from '../../managers/EndpointManager';
type State = {
    error:Error
    errorInfo:any
    windowError:Error
}
type Props = {}
export default class GlobalErrorBoundary extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = { error: null,  errorInfo:null, windowError:null};
    }
    componentWillMount = () => {
        window.addEventListener('error', this.onWindowError)
    }
    onWindowError = (event: ErrorEvent) => {
        this.setState({ windowError:event.error })
        this.sendError(event.error)
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
            {this.props.children}
            </>
    }
  }