import * as React from "react";
import {injectIntl, InjectedIntlProps} from "react-intl";
import Intl from "../../utilities/Intl"
import ApiClient from '../../network/ApiClient';
import { Button, Input , Form , FormGroup} from 'reactstrap';
import { toast } from 'react-toastify';
import { ErrorToast } from '../../components/general/Toast';
import { connect } from 'react-redux'
import * as Actions from "../../actions/Actions"
import { withRouter} from 'react-router-dom'
import { History} from 'history'
import { ApiEndpoint, LoginType } from '../../reducers/debug';

require("./Signin.scss");


export interface Props {
    setAuthorizationData:(token:string) => void,
    history:History,
    apiEndpoint?:number,
    availableApiEndpoints?:Array<ApiEndpoint>,
    setProfile:(profile:object) => void,
}
class Signin extends React.Component<Props & InjectedIntlProps, {}> {

    emailInput: HTMLInputElement
    passwordInput: HTMLInputElement
    constructor(props) {
        super(props);
        this.doSignin = this.doSignin.bind(this)
        this.loginCallback = this.loginCallback.bind(this)
    }
    loginCallback(data:any, status:string, error:string)
    {
        if(error)
        {
            toast.error(<ErrorToast message={error} />, { hideProgressBar: true })
            return
        }
        if(data.token)
        {
            this.props.setAuthorizationData(data.token)
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
                <div className="jumbotron jumbotron-fluid">
                    <div className="container">
                        <h1 className="display-4">{Intl.translate(this.props.intl, "Sign in to intra.work")}</h1>
                        <p className="lead">{Intl.translate(this.props.intl, "Enter your email address and password")}</p>
                        <Form>
                            <FormGroup>
                                <Input name="email" innerRef={(input) => { this.emailInput = input }} defaultValue="leslie@intrahouse.com" placeholder={Intl.translate(this.props.intl, "Email")} />
                            </FormGroup>
                            <FormGroup>
                                <Input name="password" innerRef={(input) => { this.passwordInput = input }} type="password" placeholder={Intl.translate(this.props.intl, "Password")} />
                            </FormGroup>
                            <FormGroup>
                                <Button color="info" onClick={this.doSignin}>{Intl.translate(this.props.intl, "Sign in")}</Button>
                            </FormGroup>
                        </Form>
                    </div>
                </div>

            </div>

        );
    }
}
const mapStateToProps = (state) => {
    return {
        apiEndpoint:state.debug.apiEndpoint,
        availableApiEndpoints:state.debug.availableApiEndpoints,
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthorizationData:(token:string) => {
            dispatch(Actions.setAuthorizationData(token))
        },
        setProfile:(profile:object) => {
            dispatch(Actions.setProfile(profile))
        }

    }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(injectIntl(Signin)));