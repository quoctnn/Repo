import * as React from 'react'
import FacebookLogin from 'react-facebook-login';
import ApiClient from '../../network/ApiClient'
import { Button, Input , Form , FormGroup} from 'reactstrap'
import { withRouter, RouteComponentProps} from 'react-router-dom'
import { connect } from 'react-redux'
import { AuthenticationManager } from '../../managers/AuthenticationManager'
import { ToastManager } from '../../managers/ToastManager'
import { ReduxState } from '../../redux'
import { EndpointLoginType } from '../../redux/endpoint'
import { EndpointManager } from '../../managers/EndpointManager'
import "./Signin.scss"
import { translate } from '../../localization/AutoIntlProvider';
import { Settings } from '../../utilities/Settings';

type OwnProps = {

}
type ReduxStateProps = {
    apiEndpoint?:number,
    language:number,
}
type Props = RouteComponentProps<any> & ReduxStateProps & OwnProps
class Signin extends React.Component<Props, {}> {

    emailInput: HTMLInputElement|null = null
    passwordInput: HTMLInputElement|null = null
    constructor(props:Props) {
        super(props);
    }
    loginCallback = (data:{token:string|null}, status:string, error:string) => {
        if(error || status == "error")
        {
            ToastManager.showErrorToast(error || translate("Could not sign in"))
            return
        }
        if(data.token)
        {
            AuthenticationManager.signIn(data.token)
        }
        const { from } = this.props.location.state || { from: { pathname: '/' } }
        this.props.history.push(from)
    }
    doSignin = (e) => {

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
    doFacebookSignin = (response) => {
        console.log(">>>>>>>>>>>>>FB RESPONSE:", response)
        //var facebookAuthURL = `https://www.facebook.com/v3.2/dialog/oauth?client_id=1011246482308121&redirect_uri=https://sso.oneuserprofile.com/auth/realms/intraWork/broker/facebook/endpoint&response_type=token,granted_scopes&scope=email&display=popup`;

    }
    render = () => {
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
                        <FacebookLogin
                            appId={Settings.FBAppId}
                            autoLoad={false}
                            responseType="token,granted_scopes"
                            scope="email"
                            callback={this.doFacebookSignin}
                        />
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
export default withRouter(connect(mapStateToProps, null)(Signin));