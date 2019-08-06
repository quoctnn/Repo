import * as React from 'react'
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';
import LinkedIn from 'linkedin-login-for-react';
import ApiClient from '../../network/ApiClient'
import { Button, Input , Form , FormGroup} from 'reactstrap'
import { withRouter, RouteComponentProps} from 'react-router-dom'
import { connect } from 'react-redux'
import { AuthenticationManager } from '../../managers/AuthenticationManager'
import { ToastManager } from '../../managers/ToastManager'
import { ReduxState } from '../../redux'
import { EndpointLoginType, allowedUsers} from '../../redux/endpoint';
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
        if (allowedUsers.length == 0 || allowedUsers.contains(this.emailInput!.value)) {
            if(endpoint.loginType == EndpointLoginType.API)
            {
                ApiClient.apiLogin(this.emailInput!.value, this.passwordInput!.value, this.loginCallback)
            }
            else if(endpoint.loginType == EndpointLoginType.NATIVE)
            {
                ApiClient.nativeLogin(this.emailInput!.value, this.passwordInput!.value, this.loginCallback)
            }
        } else {
            this.loginCallback(null, null, "User is not in whitelist");
        }
    }
    doFacebookSignin = (response) => {
        ApiClient.apiSocialLogin("facebook", response.accessToken, null, null, this.loginCallback)
    }
    doGoogleSignin = (response) => {
        ApiClient.apiSocialLogin("google", response.accessToken, null, response.tokenId, this.loginCallback)
    }
    doLinkedInSignin = (error, code, redirectUri) => {
        if (error) {
            console.error(error)
        }
        console.log(code)
        ApiClient.apiSocialLogin("linkedin", null, code, null, this.loginCallback)
    }
    render = () => {
        const endpoint = EndpointManager.currentEndpoint()
        let endpointName = endpoint.endpoint.replace(/(^\w+:|)\/\//, '');
        endpointName = endpointName.replace(/(:\d+$)/, '');
        return(
            <div id="sign-in">
                <div className="jumbotron">
                    <div className="container">
                        <h2 >{translate("Sign in to") + " " + endpointName}</h2>
                        <p className="lead">{translate("Enter your email address and password")}</p>
                        <Form>
                            <FormGroup>
                                <Input type="text" autoComplete="username" name="email" innerRef={(input) => { this.emailInput = input }} placeholder={translate("Email")} />
                            </FormGroup>
                            <FormGroup>
                                <Input autoComplete="current-password" name="password" innerRef={(input) => { this.passwordInput = input }} type="password" placeholder={translate("Password")} />
                            </FormGroup>
                            <FormGroup>
                                <Button type="submit" color="info" onClick={this.doSignin}>{translate("Sign in")}</Button>
                            </FormGroup>
                        </Form>
                        { endpoint.loginType == EndpointLoginType.API && <>
                            <FacebookLogin
                                appId={Settings.FBAppId}
                                autoLoad={false}
                                responseType="token,granted_scopes"
                                scope="email"
                                callback={this.doFacebookSignin}
                            /><br></br>
                            <GoogleLogin
                                clientId={Settings.GoogleClientID}
                                buttonText="Sign in with Google"
                                onSuccess={this.doGoogleSignin}
                                onFailure={this.doGoogleSignin}
                                cookiePolicy={'single_host_origin'}
                            /><br></br>
                            {/* Linkedin provider on login API is broken...
                                <LinkedIn
                                clientId={Settings.LinkedInClientID}
                                callback={this.doLinkedInSignin}
                                text='Sign in with LinkedIn' /> */}
                        </>
                        }
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