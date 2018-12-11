import * as React from 'react';
import { translate } from '../../components/intl/AutoIntlProvider';
import ApiClient from '../../network/ApiClient';
import { Button, Input , Form , FormGroup} from 'reactstrap';
import { History} from 'history'
import { connect } from 'react-redux'
import * as Actions from '../../actions/Actions';
import { ApiEndpoint, LoginType } from '../../reducers/debug';
import { RootState } from '../../reducers/index';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { ToastManager } from '../../managers/ToastManager';

require("./Signin.scss");


export interface Props {
    setAuthorizationData:(token:string) => void,
    apiEndpoint?:number,
    availableApiEndpoints?:Array<ApiEndpoint>,
    language:number,
    history:History,
}
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
        let endpoint = this.props.availableApiEndpoints[this.props.apiEndpoint]
        if(endpoint.loginType == LoginType.API)
        {
           ApiClient.apiLogin(this.emailInput!.value, this.passwordInput!.value, this.loginCallback)
        }
        else if(endpoint.loginType == LoginType.NATIVE)
        {
            ApiClient.nativeLogin(this.emailInput!.value, this.passwordInput!.value, this.loginCallback)

        }
    }
    render() {
        let endpoint = this.props.availableApiEndpoints[this.props.apiEndpoint].endpoint
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
const mapStateToProps = (state:RootState) => {
    return {
        apiEndpoint:state.debug.apiEndpoint,
        availableApiEndpoints:state.debug.availableApiEndpoints,
        language: state.settings.language,
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthorizationData:(token:string, sessionid:string) => {
            dispatch(Actions.setAuthorizationData(token, sessionid))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Signin);