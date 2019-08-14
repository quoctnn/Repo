import * as React from 'react'
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
import GoogleLogin from 'react-google-login';
import LinkedIn from 'linkedin-login-for-react';
import ApiClient from '../../network/ApiClient'
import { Button, Input , Form , FormGroup, InputGroupAddon, InputGroup} from 'reactstrap'
import { withRouter, RouteComponentProps, Link} from 'react-router-dom'
import { connect } from 'react-redux'
import { AuthenticationManager } from '../../managers/AuthenticationManager'
import { ToastManager } from '../../managers/ToastManager'
import { ReduxState } from '../../redux'
import { EndpointLoginType, allowedUsers} from '../../redux/endpoint';
import { EndpointManager } from '../../managers/EndpointManager'
import "./Signin.scss"
import { translate } from '../../localization/AutoIntlProvider';
import { Settings } from '../../utilities/Settings';
import DashFillComponent from '../../components/general/DashFillComponent';
import Routes from '../../utilities/Routes';
import { availableLanguages } from '../../redux/language';
import { nullOrUndefined } from '../../utilities/Utilities';
import Logo from '../../components/general/images/Logo';

type SectionComponentProps = {
    title:string
    secondaryTitle?:string
    icon:string
    titleFirst?:boolean
}
const SectionComponent = (props:SectionComponentProps) => {
    const titleFirst = nullOrUndefined(props.titleFirst) ? true : props.titleFirst
    return <div className="section">
                <div className="left">
                    {titleFirst && <div className="title">{props.title}</div>}
                    {props.secondaryTitle && <div className="secondary-title">{props.secondaryTitle}</div>}
                    {!titleFirst && <div className="title">{props.title}</div>}
                </div>
                <i className={props.icon}></i>
            </div>
}
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
        if(response.accessToken)
            ApiClient.apiSocialLogin("facebook", response.accessToken, null, null, this.loginCallback)
    }
    doGoogleSignin = (response) => {
        if(response.accessToken)
            ApiClient.apiSocialLogin("google", response.accessToken, null, response.tokenId, this.loginCallback)
    }
    doLinkedInSignin = (error, code, redirectUri) => {
        if (error) {
            console.error(error)
        }
        console.log(code)
        ApiClient.apiSocialLogin("linkedin", null, code, null, this.loginCallback)
    }
    selectLocale = (index:number) => () => {
        window.app.setLanguage(index)
    }
    render = () => {
        const endpoint = EndpointManager.currentEndpoint()
        let endpointName = endpoint.endpoint.replace(/(^\w+:|)\/\//, '');
        endpointName = endpointName.replace(/(:\d+$)/, '');
        const socialLinksActive = endpoint.loginType == EndpointLoginType.API && !Settings.isElectron
        return(
            <div id="sign-in">
                <div className="triangles-bg"></div>
                <div className="gradient-bg"></div>
                <DashFillComponent useFillMode={true}/>
                <div className="dashboard-container">
                    <div className="sign-in-container">
                        <div className="sign-in">
                            <div className="left">
                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 688 689">
                                    <defs>
                                        <path id="a" d="M31.77-358.591c30.815-15.789 68.78-15.789 99.594 0L583.77-126.785c30.814 15.79 49.796 44.968 49.796 76.545v463.614c0 31.577-18.982 60.756-49.796 76.545L131.364 721.726c-30.815 15.788-68.78 15.788-99.593 0l-452.407-231.807c-30.815-15.789-49.797-44.968-49.797-76.545V-50.24c0-31.577 18.982-60.756 49.797-76.545"/>
                                    </defs>
                                    <g fill="none" fillRule="nonzero" transform="rotate(25 81.567 181.567)">
                                        <use fill="#20BE86"  xlinkHref="#a"/>
                                        <use fill="#FFF" xlinkHref="#a"/>
                                    </g>
                                </svg>
                                <div className="login-panel">
                                    <h2 className="title">{translate("Login")}</h2>
                                    <div className="sub-title mb-1">
                                        {translate("no_account_question")}{" "}
                                        <Link className="s-link" to={Routes.SIGNUP}>{translate("Sign up")}</Link>
                                    </div>
                                    <Form>
                                        <InputGroup className="form-group form-input">
                                            <Input type="text" autoComplete="username" name="email" innerRef={(input) => { this.emailInput = input }} defaultValue="leslie@intrahouse.com" placeholder={translate("Email")} />
                                            <InputGroupAddon addonType="append"><i className="fas fa-user"></i></InputGroupAddon>
                                        </InputGroup>
                                        <InputGroup className="form-group form-input">
                                            <Input autoComplete="current-password" name="password" innerRef={(input) => { this.passwordInput = input }} type="password" placeholder={translate("Password")} />
                                            <InputGroupAddon addonType="append"><i className="fas fa-lock"></i></InputGroupAddon>
                                        </InputGroup>
                                        <FormGroup>
                                            <Button className="login-button" type="submit" color="info" onClick={this.doSignin}>{translate("Sign in")}</Button>
                                        </FormGroup>
                                    </Form>
                                </div>
                                <div className="social-sign-in-panel">
                                    <h2 className="social-login-title">{translate("social_login_title")}</h2>
                                    <div className="social-login">
                                        <FacebookLogin
                                            appId={Settings.FBAppId}
                                            autoLoad={false}
                                            responseType="token,granted_scopes"
                                            scope="email"
                                            callback={this.doFacebookSignin}
                                            render={renderProps => {
                                                return <button className="social-sign-on-button" onClick={renderProps.onClick} disabled={!socialLinksActive}>
                                                    <div className="fb-icon social-icon"></div>
                                                    {translate("sign_in_facebook")}
                                                    </button>
                                            }}
                                        />
                                        <GoogleLogin
                                            clientId={Settings.GoogleClientID}
                                            buttonText="Sign in with Google"
                                            onSuccess={this.doGoogleSignin}
                                            onFailure={this.doGoogleSignin}
                                            cookiePolicy={'single_host_origin'}
                                            render={renderProps => {

                                                return <button className="social-sign-on-button" onClick={renderProps.onClick} disabled={!socialLinksActive}>
                                                            <div className="google-icon social-icon"></div>
                                                            {translate("sign_in_google")}
                                                        </button>
                                            }}
                                        />
                                        {/* Linkedin provider on login API is broken...
                                            <LinkedIn
                                            clientId={Settings.LinkedInClientID}
                                            callback={this.doLinkedInSignin}
                                            text='Sign in with LinkedIn' /> */}
                                    </div>
                                </div>
                            </div>
                            <div className="right">
                                <div className="intro">{translate("welcome_to")}</div>
                                <div className="title"><Logo idPrefix="signin" className="logo" progress={0}/></div>
                                <SectionComponent title={translate("streamlines_communication")} icon="fas fa-rainbow"/>
                                <SectionComponent title={translate("unifies_teams")} icon="fas fa-people-carry"/>
                                <SectionComponent titleFirst={false} title={translate("simple_and_transparent")} secondaryTitle={translate("makes_project_management")} icon="fas fa-shapes"/>
                                <SectionComponent titleFirst={true} title={translate("Eliminating")} secondaryTitle={translate("other_communication_methods")} icon="fas fa-running"/>
                                <div className="platforms-description">{translate("iw_platforms_text")}</div>
                                <div className="sub-title">{translate("login_secondary_title")}</div>
                            </div>
                        </div>
                        <div className="footer">
                            <div onClick={this.selectLocale(availableLanguages.indexOf("nb"))} className="locale-selector locale_nb"></div>
                            <div onClick={this.selectLocale(availableLanguages.indexOf("es"))} className="locale-selector locale_es ml-1"></div>
                            <div className="ml-3">{translate("iw_made_in")}</div>
                        </div>
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