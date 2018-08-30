import * as React from 'react';
import { translate } from '../../components/intl/AutoIntlProvider';
import ApiClient from '../../network/ApiClient';
import { Button, Input , Form , FormGroup} from 'reactstrap';
import { toast } from 'react-toastify';
import { ErrorToast } from '../../components/general/Toast';
import { connect } from 'react-redux'
import * as Actions from '../../actions/Actions';
import { withRouter} from 'react-router-dom'
import { History} from 'history'
import { ApiEndpoint, LoginType } from '../../reducers/debug';
import { RootReducer } from '../../reducers/index';

require("./Signin.scss");


export interface Props {
    setAuthorizationData:(token:string, sessionid:string) => void,
    history:History,
    apiEndpoint?:number,
    availableApiEndpoints?:Array<ApiEndpoint>,
    language:number,
}
class Signin extends React.Component<Props, {}> {

    emailInput: HTMLInputElement
    passwordInput: HTMLInputElement
    constructor(props) {
        super(props);
        this.doSignin = this.doSignin.bind(this)
        this.loginCallback = this.loginCallback.bind(this)
    }
    loginCallback(data:any, status:string, error:string)
    {
        if(error || status == "error")
        {
            toast.error(<ErrorToast message={error || "Could not sign in"} />, { hideProgressBar: true })
            return
        }
        if(data.token)
        {
            this.props.setAuthorizationData(data.token, data.session_id)
        }
    }
    doSignin(e)
    {
        e.preventDefault()
        let endpoint = this.props.availableApiEndpoints[this.props.apiEndpoint]
        if(endpoint.loginType == LoginType.API)
        {
            ApiClient.apiLogin(this.emailInput.value, this.passwordInput.value, this.loginCallback)
        }
        else if(endpoint.loginType == LoginType.NATIVE)
        {
            ApiClient.nativeLogin(this.emailInput.value, this.passwordInput.value, this.loginCallback)
        }
    }
    render() {
        return(
            <div id="sign-in">
                <div className="jumbotron">
                    <div className="container">
                        <h1 className="display-4">{translate("Sign in to intra.work")}</h1>
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
const mapStateToProps = (state:RootReducer) => {
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Signin));