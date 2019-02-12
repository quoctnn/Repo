import * as React from 'react'
import ApiClient from '../../network/ApiClient'
import { Button, Input , Form , FormGroup} from 'reactstrap'
import { withRouter, RouteComponentProps} from 'react-router-dom'
import { connect } from 'react-redux'
import { AuthenticationManager } from '../../managers/AuthenticationManager'
import { ToastManager } from '../../managers/ToastManager'
import { ReduxState } from '../../redux'
import { setAuthenticationTokenAction } from '../../redux/authentication'
import { EndpointLoginType } from '../../redux/endpoint'
import { EndpointManager } from '../../managers/EndpointManager'
import "./Signin.scss"
import { translate } from '../../localization/AutoIntlProvider';

interface OwnProps {
    
}
interface ReduxStateProps{
    apiEndpoint?:number,
    language:number,
}
interface ReduxDispatchProps{
    setAuthorizationData:(token:string) => void,
}
type Props = RouteComponentProps<any> & ReduxDispatchProps & ReduxStateProps & OwnProps
class Signin extends React.Component<Props, {}> {

    emailInput: HTMLInputElement|null = null
    passwordInput: HTMLInputElement|null = null
    constructor(props) {
        super(props);
        this.doSignin = this.doSignin.bind(this)
        this.loginCallback = this.loginCallback.bind(this)
    }
    loginCallback(data:{token:string|null}, status:string, error:string)
    {
        if(error || status == "error")
        {
            ToastManager.showErrorToast(error || translate("Could not sign in"))
            return
        }
        if(data.token)
        {
            this.props.setAuthorizationData(data.token)
            AuthenticationManager.signIn(data.token)
        }
        this.props.history.push('/')
    }
    doSignin(e)
    {
        
        e.preventDefault()
        let endpoint = EndpointManager.currentEndpoint()
        if(endpoint.loginType == EndpointLoginType.API)
        {
           ApiClient.apiLogin(this.emailInput!.value, this.passwordInput!.value, this.loginCallback)
        }
        else if(endpoint.loginType == EndpointLoginType.NATIVE)
        {
            ApiClient.nativeLogin(this.emailInput!.value, this.passwordInput!.value, this.loginCallback)

        }
    }
    render() {
        let endpoint = EndpointManager.currentEndpoint().endpoint
        endpoint = endpoint.replace(/(^\w+:|)\/\//, '');
        endpoint = endpoint.replace(/(:\d+$)/, '');
        return(
            <div id="sign-in">
                <div className="jumbotron">
                    <div className="container">
                        <h2 >{translate("Sign in to") + " " + endpoint}</h2>
                        <p className="lead">{translate("Enter your email address and password")}</p>
                        <Form>
                            <FormGroup>
                                <Input type="text" autoComplete="username" name="email" innerRef={(input) => { this.emailInput = input }} defaultValue="leslie@intrahouse.com" placeholder={translate("Email")} />
                            </FormGroup>
                            <FormGroup>
                                <Input autoComplete="current-password" name="password" innerRef={(input) => { this.passwordInput = input }} type="password" placeholder={translate("Password")} />
                            </FormGroup>
                            <FormGroup>
                                <Button type="submit" color="info" onClick={this.doSignin}>{translate("Sign in")}</Button>
                            </FormGroup>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState):ReduxStateProps => {
    return {
        apiEndpoint:state.endpoint.endpoint,
        language: state.language.language,
    };
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {
        setAuthorizationData:(token:string) => {
            dispatch(setAuthenticationTokenAction(token))
        }
    }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Signin));