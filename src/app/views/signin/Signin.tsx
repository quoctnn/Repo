import * as React from 'react'
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
import GoogleLogin from 'react-google-login';
import LinkedIn from 'linkedin-login-for-react';
import { ApiClient } from '../../network/ApiClient'
import { Button, Input, Form, FormGroup, InputGroupAddon, InputGroup, FormFeedback, Alert } from 'reactstrap'
import { withRouter, RouteComponentProps, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { AuthenticationManager } from '../../managers/AuthenticationManager'
import { ToastManager } from '../../managers/ToastManager'
import { ReduxState } from '../../redux'
import { EndpointLoginType } from '../../redux/endpoint'
import { EndpointManager } from '../../managers/EndpointManager'
import "./Signin.scss"
import { translate } from '../../localization/AutoIntlProvider';
import { Settings } from '../../utilities/Settings';
import DashFillComponent from '../../components/general/DashFillComponent';
import { nullOrUndefined } from '../../utilities/Utilities';
import Logo from '../../components/general/images/Logo';
import { RequestErrorData, GDPRFormAnswers, GDPRData, AppLanguage } from '../../types/intrasocial_types';
import SimpleDialog from '../../components/general/dialogs/SimpleDialog';
import GdprForm from './GdprForm';
import classnames = require('classnames');
enum LoginProvider {
    google = "google", facebook = "facebook", linkedIn = "linkedin", native = "native"
}
type LoginContinuationData = {
    accessToken?: string
    tokenId?: string
    provider: LoginProvider
}
type SectionComponentProps = {
    title: string
    secondaryTitle?: string
    icon: string
    titleFirst?: boolean
}
const SectionComponent = (props: SectionComponentProps) => {
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
    apiEndpoint?: number,
    language: AppLanguage,
}
type Props = RouteComponentProps<any> & ReduxStateProps & OwnProps
type State = {
    error: string
    updateGdprContinuationKey: string
    gdprUserResponse: GDPRFormAnswers
    gdprData: GDPRData,
    formErrors: { [key: string]: string }
    registerMode: boolean
    verifyEmail: boolean
    email: string
}
export const normalizeformErrors = (errors: { [key: string]: string[] }) => {
    const dict = {}
    const keys = Object.keys(errors)
    keys.forEach(k => {
        dict[k] = errors[k][0]
    })
    return dict
}
class Signin extends React.Component<Props, State> {

    emailInput: HTMLInputElement | null = null
    usernameInput: HTMLInputElement | null = null
    passwordInput: HTMLInputElement | null = null
    firstNameInput: HTMLInputElement | null = null
    lastNameInput: HTMLInputElement | null = null
    loginContinuationData: LoginContinuationData
    constructor(props: Props) {
        super(props);
        this.state = {
            error: null,
            updateGdprContinuationKey: null,
            gdprUserResponse: null,
            gdprData: null,
            formErrors: {},
            registerMode: false,
            verifyEmail: false,
            email: null,
        }
    }
    loginCallback = (data: any, status: string, errorData: RequestErrorData) => {
        if (errorData) {
            if (errorData.detail && errorData.detail.extra && errorData.detail.extra.gdprInfo) {
                // Email verification or GDPR consent not performed
                this.setState(() => {
                    return { gdprData: errorData.detail.extra, formErrors: {}, error: null }
                })
                return
            }
            else {
                let error = (errorData.detail && errorData.detail.error_description) || errorData.data.non_field_errors
                if (error) {
                    // Invalid password on nativeLogin
                    this.setState(() => {
                        return { error, formErrors: {} }
                    })
                    return
                }
                else if (typeof errorData.data == "object") {
                    this.setState(() => {
                        return { formErrors: normalizeformErrors(errorData.data) }
                    })
                }

            }
            ToastManager.showRequestErrorToast(errorData)
            return
        } else {
            this.setState(() => { return { formErrors: {} } })
        }
        if (data.token) {
            AuthenticationManager.signIn(data.token)
        } else {
            ToastManager.showRequestErrorToast(new RequestErrorData("No token in response", "Error"))
        }
        const { from } = this.props.location.state || { from: { pathname: '/' } }
        this.props.history.push(from)
    }
    doSignin = (e) => {

        e.preventDefault()
        this.setState({ error: null })
        this.loginContinuationData = { provider: LoginProvider.native }
        this.continueSignin(this.loginContinuationData)
    }
    doRegister = (e) => {
        e.preventDefault()
        this.setState({ error: null })
        this.loginContinuationData = { provider: LoginProvider.native }
        const gdprUserResponse = this.state.gdprUserResponse
        let endpoint = EndpointManager.currentEndpoint()
        if (endpoint.loginType == EndpointLoginType.NATIVE) {
            window.alert("Registering on local servers not available yet!")
            return
        }
        if (!gdprUserResponse) {
            ApiClient.getGDPRForm(this.props.language.toLocaleLowerCase(), (data, status, error) => {
                if (data) {
                    const gdprData: GDPRData = { gdprInfo: data, requiredActions: undefined, updateGdprContinuationKey: undefined }
                    this.setState({ gdprData: gdprData })
                }
            })
        } else {
            this.continueRegister()
        }
    }
    continueRegister = () => {
        const gdprUserResponse = this.state.gdprUserResponse
        if (gdprUserResponse) {
            this.setState(() => { return { gdprData: null } })
            ApiClient.apiRegister(this.firstNameInput!.value, this.lastNameInput!.value, this.usernameInput!.value, this.emailInput!.value, this.passwordInput!.value, gdprUserResponse, this.registerCallback)
        }
    }
    registerCallback = (data: any, status: string, errorData: RequestErrorData) => {
        if (errorData) {
            if (errorData.detail && errorData.detail.extra && errorData.detail.extra.gdprInfo) {
                // Email verification or GDPR consent not performed
                this.setState(() => {
                    return { gdprData: errorData.detail.extra, formErrors: {}, error: null }
                })
                return
            }
            else {
                let error = (errorData.detail && errorData.detail.error_description) || errorData.data.non_field_errors
                if (error) {
                    // Invalid password on nativeLogin
                    this.setState(() => {
                        return { error, formErrors: {} }
                    })
                    return
                }
                else if (errorData.data && errorData.data.error) {
                    switch (errorData.data.error) {
                        case "NO_FIRST_NAME":
                            this.setState(() => { return { formErrors: { "first-name": translate("input.error.length.required") } } });
                            break;
                        case "NO_LAST_NAME":
                            this.setState(() => { return { formErrors: { "last-name": translate("input.error.length.required") } } });
                            break;
                        case "NO_PASSWORD":
                            this.setState(() => { return { formErrors: { "password": translate("input.error.length.required") } } });
                            break;
                        case "NO_EMAIL":
                            this.setState(() => { return { formErrors: { "email": translate("input.error.length.required") } } });
                            break;
                        case "NO_USERNAME":
                            this.setState(() => { return { formErrors: { "username": translate("input.error.length.required") } } });
                            break;
                        case "USER_EXISTS":
                            this.setState(() => { return { formErrors: { "username": translate("input.error.username.exists") } } });
                            break;
                        case "NAME_FOUND_IN_DB":
                            window.alert(translate("register.error.name.found"));
                            break;
                        default:
                            console.log(errorData.data.error);
                            ToastManager.showRequestErrorToast(errorData);
                    }
                }
            }
        } else {
            this.setState(() => { return { formErrors: {} } })
        }
        if (status == "success" && data) {
            this.verifyEmailPopup(true)(null);
        }
    }
    verifyEmailPopup = (visible: boolean) => (e: React.MouseEvent) => {
        console.log(visible);
        if (visible) {
            this.setState(() => {
                return { verifyEmail: true, registerMode: false, email: this.emailInput!.value }
            })
        }
        else {
            this.setState(() => {
                return { verifyEmail: false }
            })
        }
    }
    continueSignin = (data: LoginContinuationData) => {
        switch (data.provider) {
            case LoginProvider.facebook: this.continueFacebookSignin(data); break;
            case LoginProvider.google: this.continueGoogleSignin(data); break;
            case LoginProvider.linkedIn: this.continueLinkedInSignin(data); break;
            case LoginProvider.native: this.continueNativeSignin(data); break;
            default: break;
        }
    }
    doFacebookSignin = (response) => {
        if (response.accessToken) {
            this.loginContinuationData = { provider: LoginProvider.facebook, accessToken: response.accessToken }
            this.continueSignin(this.loginContinuationData)
        }
    }
    doGoogleSignin = (response) => {
        if (response.accessToken) {
            this.loginContinuationData = { provider: LoginProvider.google, accessToken: response.accessToken, tokenId: response.tokenId }
            this.continueSignin(this.loginContinuationData)
        }
    }
    doLinkedInSignin = (error, code, redirectUri) => {
        if (error) {
            console.error(error)
        }
        this.loginContinuationData = { provider: LoginProvider.linkedIn, accessToken: code }
        this.continueSignin(this.loginContinuationData)
    }
    continueNativeSignin = (data: LoginContinuationData) => {

        const continuationKey = this.state.updateGdprContinuationKey
        const gdprUserResponse = this.state.gdprUserResponse
        let endpoint = EndpointManager.currentEndpoint()
        if (endpoint.loginType == EndpointLoginType.API) {
            ApiClient.apiLogin(this.emailInput!.value, this.passwordInput!.value, continuationKey, gdprUserResponse, this.loginCallback)
        }
        else if (endpoint.loginType == EndpointLoginType.NATIVE) {
            ApiClient.nativeLogin(this.emailInput!.value, this.passwordInput!.value, continuationKey, gdprUserResponse, this.loginCallback)
        }
    }
    continueFacebookSignin = (data: LoginContinuationData) => {
        ApiClient.apiSocialLogin(LoginProvider.facebook, data.accessToken, null, null, this.state.updateGdprContinuationKey, this.state.gdprUserResponse, this.loginCallback)
    }
    continueGoogleSignin = (data: LoginContinuationData) => {
        ApiClient.apiSocialLogin(LoginProvider.google, data.accessToken, null, data.tokenId, this.state.updateGdprContinuationKey, this.state.gdprUserResponse, this.loginCallback)
    }
    continueLinkedInSignin = (data: LoginContinuationData) => {
        ApiClient.apiSocialLogin(LoginProvider.linkedIn, null, data.accessToken, null, this.state.updateGdprContinuationKey, this.state.gdprUserResponse, this.loginCallback)
    }
    selectLocale = (language: AppLanguage) => () => {
        window.app.setLanguage(language)
    }
    closeGdprInfoDialog = () => {
        this.setState(() => {
            return { gdprData: null }
        })
    }
    handleGdprFormComplete = (form: GDPRFormAnswers) => {
        this.setState(() => {
            return { gdprUserResponse: form, updateGdprContinuationKey: this.state.gdprData.updateGdprContinuationKey }
        }, () => {
            if (this.loginContinuationData)
                if (this.state.registerMode) {
                    this.continueRegister()
                } else {
                    this.continueSignin(this.loginContinuationData)
                }
        })
    }
    toggleRegister = () => {
        this.setState({ registerMode: !this.state.registerMode })
    }
    renderGdprInfoDialog = () => {
        const visible = !!this.state.gdprData
        return <SimpleDialog showCloseButton={false} didCancel={this.closeGdprInfoDialog} visible={visible}>
            <GdprForm data={this.state.gdprData && this.state.gdprData.gdprInfo} onCancel={this.closeGdprInfoDialog} onFormComplete={this.handleGdprFormComplete} />
        </SimpleDialog>
    }
    renderLoginPanel = () => {
        const errorMsg = this.state.error
        const usernameError = this.state.formErrors["username"]
        const passwordError = this.state.formErrors["password"]
        const submitButtonClasses = classnames("login-button form-control", { "is-invalid": !!errorMsg })
        return (
            <div className="login-panel">
                <h2 className="title">{translate("Login")}</h2>
                <div className="sub-title mb-1">
                    {translate("no_account_question")}{" "}
                    <a className="s-link" onClick={this.toggleRegister}>{translate("Sign up")}</a>
                </div>
                <Form>
                    <InputGroup className="form-group form-input">
                        <Input invalid={!!usernameError} type="text" autoComplete="username" name="email" innerRef={(input) => { this.emailInput = input }} placeholder={translate("Email")} />
                        {usernameError && <FormFeedback tooltip={true}>{usernameError}</FormFeedback>}
                        <InputGroupAddon addonType="append"><i className="fas fa-user"></i></InputGroupAddon>
                    </InputGroup>
                    <InputGroup className="form-group form-input">
                        <Input invalid={!!passwordError} autoComplete="current-password" name="password" innerRef={(input) => { this.passwordInput = input }} type="password" placeholder={translate("Password")} />
                        <InputGroupAddon addonType="append"><i className="fas fa-lock"></i></InputGroupAddon>
                        {passwordError && <FormFeedback tooltip={true}>{passwordError}</FormFeedback>}
                    </InputGroup>
                    <FormGroup>
                        <Button className={submitButtonClasses} type="submit" color="info" onClick={this.doSignin}>{translate("Sign in")}</Button>
                        {errorMsg && <FormFeedback tooltip={true}>{errorMsg}</FormFeedback>}
                    </FormGroup>
                </Form>
            </div>)
    }
    renderRegisterPanel = () => {
        const errorMsg = this.state.error
        const usernameError = this.state.formErrors["username"]
        const emailError = this.state.formErrors["email"]
        const passwordError = this.state.formErrors["password"]
        const firstNameError = this.state.formErrors["first-name"]
        const lastNameError = this.state.formErrors["last-name"]
        const submitButtonClasses = classnames("login-button form-control", { "is-invalid": !!errorMsg })
        return (
            <div className="login-panel">
                <h2 className="title">{translate("Register")}</h2>
                <div className="sub-title mb-1">
                    {translate("already_account_question")}{" "}
                    <a className="s-link" onClick={this.toggleRegister}>{translate("Sign in")}</a>
                </div>
                <Form>
                    <InputGroup className="form-group form-input">
                        <Input invalid={!!emailError} type="text" autoComplete="email" name="email" innerRef={(input) => { this.emailInput = input }} placeholder={translate("Email")} />
                        {emailError && <FormFeedback tooltip={true}>{emailError}</FormFeedback>}
                    </InputGroup>
                    <div className="d-flex">
                        <InputGroup className="form-group form-input">
                            <Input invalid={!!firstNameError} autoComplete="first-name" name="first-name" innerRef={(input) => { this.firstNameInput = input }} placeholder={translate("common.first_name")} />
                            {firstNameError && <FormFeedback tooltip={true}>{firstNameError}</FormFeedback>}
                        </InputGroup>
                        <InputGroup className="form-group form-input">
                            <Input invalid={!!lastNameError} autoComplete="last-name" name="last-name" innerRef={(input) => { this.lastNameInput = input }} placeholder={translate("common.last_name")} />
                            {lastNameError && <FormFeedback tooltip={true}>{lastNameError}</FormFeedback>}
                        </InputGroup>
                    </div>
                    <InputGroup className="form-group form-input">
                        <Input invalid={!!usernameError} type="text" autoComplete="new-username" name="username" innerRef={(input) => { this.usernameInput = input }} placeholder={translate("Username")} />
                        {usernameError && <FormFeedback tooltip={true}>{usernameError}</FormFeedback>}
                        <InputGroupAddon addonType="append"><i className="fas fa-user"></i></InputGroupAddon>
                    </InputGroup>
                    <InputGroup className="form-group form-input">
                        <Input invalid={!!passwordError} autoComplete="new-password" name="password" innerRef={(input) => { this.passwordInput = input }} type="password" placeholder={translate("Password")} />
                        <InputGroupAddon addonType="append"><i className="fas fa-lock"></i></InputGroupAddon>
                        {passwordError && <FormFeedback tooltip={true}>{passwordError}</FormFeedback>}
                    </InputGroup>
                    <FormGroup>
                        <Button className={submitButtonClasses} type="submit" color="info" onClick={this.doRegister}>{translate("Sign up")}</Button>
                        {errorMsg && <FormFeedback tooltip={true}>{errorMsg}</FormFeedback>}
                    </FormGroup>
                </Form>
            </div>)

    }
    render = () => {
        const endpoint = EndpointManager.currentEndpoint()
        const socialLinksActive = endpoint.loginType == EndpointLoginType.API && !Settings.isElectron
        return (
            <div id="sign-in">
                <div className="triangles-bg"></div>
                <div className="gradient-bg"></div>
                <DashFillComponent useFillMode={true} />
                <div className="dashboard-container">
                    {this.state.verifyEmail &&
                        <div className="verify-email-container">
                            <div className="verify-email-text">
                                {translate("verify.email.text").format(this.state.email)}
                            </div>
                            <Button className="btn btn-clear" onClick={this.verifyEmailPopup(false)}><i className="fa fa-times-circle" /></Button>
                        </div>
                    }
                    <div className="sign-in-container">
                        <div className="sign-in">
                            <div className="left">
                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 688 689">
                                    <defs>
                                        <path id="a" d="M31.77-358.591c30.815-15.789 68.78-15.789 99.594 0L583.77-126.785c30.814 15.79 49.796 44.968 49.796 76.545v463.614c0 31.577-18.982 60.756-49.796 76.545L131.364 721.726c-30.815 15.788-68.78 15.788-99.593 0l-452.407-231.807c-30.815-15.789-49.797-44.968-49.797-76.545V-50.24c0-31.577 18.982-60.756 49.797-76.545" />
                                    </defs>
                                    <g fill="none" fillRule="nonzero" transform="rotate(25 81.567 181.567)">
                                        <use fill="#20BE86" xlinkHref="#a" />
                                        <use fill="#FFF" xlinkHref="#a" />
                                    </g>
                                </svg>
                                {this.state.registerMode &&
                                    this.renderRegisterPanel()
                                    ||
                                    this.renderLoginPanel()
                                }
                                <div className="social-sign-in-panel">
                                    <h2 className="social-login-title">{translate(this.state.registerMode ? "social_register_title" : "social_login_title")}</h2>
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
                                        <button className="social-sign-on-button" disabled={true}>
                                            <div className="social-icon"></div>
                                            {translate("sign_in_linkedin")}
                                        </button>
                                        {/* <LinkedIn
                                            className="social-sign-on-button"
                                            clientId={Settings.LinkedInClientID}
                                            callback={this.doLinkedInSignin}
                                            text='Sign in with LinkedIn'
                                            //The LinkedIn module does not support the render property
                                            render={renderProps => {
                                                return <button  onClick={renderProps.onClick} disabled={!socialLinksActive}>
                                                            <div className="social-icon"></div>
                                                            {translate("sign_in_linkedin")}
                                                        </button>
                                            }}
                                        /> */}
                                    </div>
                                </div>
                            </div>
                            <div className="right">
                                <div className="intro">{translate("welcome_to")}</div>
                                <div className="title"><Logo idPrefix="signin" className="logo" progress={0} /></div>
                                <SectionComponent title={translate("streamlines_communication")} icon="fas fa-rainbow" />
                                <SectionComponent title={translate("unifies_teams")} icon="fas fa-people-carry" />
                                <SectionComponent titleFirst={false} title={translate("simple_and_transparent")} secondaryTitle={translate("makes_project_management")} icon="fas fa-shapes" />
                                <SectionComponent titleFirst={true} title={translate("Eliminating")} secondaryTitle={translate("other_communication_methods")} icon="fas fa-running" />
                                <div className="platforms-description">{translate("iw_platforms_text")}</div>
                                <div className="sub-title">{translate("login_secondary_title")}</div>
                            </div>
                        </div>
                        <div className="footer">
                            <div onClick={this.selectLocale(AppLanguage.norwegian)} className="locale-selector locale_nb"></div>
                            <div onClick={this.selectLocale(AppLanguage.spanish)} className="locale-selector locale_es ml-1"></div>
                            <div className="ml-3">{translate("iw_made_in")}</div>
                        </div>
                    </div>
                </div>
                {this.renderGdprInfoDialog()}
            </div>
        );
    }
}
const mapStateToProps = (state: ReduxState): ReduxStateProps => {
    return {
        apiEndpoint: state.endpoint.endpoint,
        language: state.language.language,
    };
}
export default withRouter(connect(mapStateToProps, null)(Signin));