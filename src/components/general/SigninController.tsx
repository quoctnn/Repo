import * as React from "react";
import { withRouter} from 'react-router-dom'
import { connect } from 'react-redux'
import * as Actions from "../../actions/Actions"
import { History} from 'history'
import ApiClient from '../../network/ApiClient';
import { AjaxRequest } from '../../network/AjaxRequest';
import { ApiEndpoint } from '../../reducers/debug';
import { toast } from 'react-toastify';
import { ErrorToast } from '../../components/general/Toast';
import { Routes } from '../../utilities/Routes';

export interface Props {
    profile?:any,
    apiEndpoint:number,
    accessToken:string,
    availableApiEndpoints?:Array<ApiEndpoint>,
    history:History,
    updated:number,
    signedIn:boolean,

    signOut:() => void,
    setProfile:(profile:object) => void,
    setSignedIn:(signedIn:boolean) => void
}

class SigninController extends React.Component<Props, {}> {
    constructor(props) {
        super(props);
        this.fetchProfile = this.fetchProfile.bind(this)
        this.updateAutorization = this.updateAutorization.bind(this)
        this.getCurrentToken = this.getCurrentToken.bind(this)
        this.signOutIfNeeded = this.signOutIfNeeded.bind(this)
    }
    componentDidMount()
    {
        if(this.props.accessToken || this.props.availableApiEndpoints[this.props.apiEndpoint].token)
        {
            this.updateAutorization()
            this.fetchProfile()
        }
    }
    componentDidUpdate(prevProps:Props, prevState) {
        let prevToken = prevProps.accessToken || prevProps.availableApiEndpoints[prevProps.apiEndpoint].token
        let currentToken = this.getCurrentToken()
        if(prevProps.accessToken != this.props.accessToken || prevProps.apiEndpoint != this.props.apiEndpoint || currentToken != prevToken)
        {
            if(currentToken)
            {
                this.updateAutorization()
                this.fetchProfile()
            }
            else 
            {
                this.signOutIfNeeded()
            }
        }
    }
    getCurrentToken()
    {
        return this.props.accessToken || this.props.availableApiEndpoints[this.props.apiEndpoint].token
    }
    signOutIfNeeded()
    {
        if(this.props.profile)
        {
            this.props.setProfile(null)
            this.props.setSignedIn(false)
            this.props.history.push(Routes.SIGNIN)
        }
    }
    updateAutorization()
    {
        AjaxRequest.setup(this.props.availableApiEndpoints[this.props.apiEndpoint], this.props.accessToken)
    }
    fetchProfile()
    {
        ApiClient.getMyProfile( (data, status, error) => {
            if(data) 
            {
                this.props.setProfile(data)
                this.props.setSignedIn(true)
                this.props.history.push(Routes.ROOT)
            }
            else if(error)
            {
                this.props.setProfile(null)
                this.props.setSignedIn(false)
                this.props.history.push(Routes.SIGNIN)
                toast.error(<ErrorToast message={error} />, { hideProgressBar: true })
            }
        })
    }
    render() 
    {
        return(
            <div id="signin-controller">
                {this.props.children}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        profile:state.profile, 
        apiEndpoint:state.debug.apiEndpoint, 
        accessToken:state.debug.accessToken,
        availableApiEndpoints:state.debug.availableApiEndpoints,
        updated:state.debug.updated,
        signedIn:state.settings.signedIn
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        signOut:() => {
            dispatch(Actions.setProfile(null))
            dispatch(Actions.setAuthorizationData(null))
        },
        setProfile:(profile:object) => {
            dispatch(Actions.setProfile(profile))
        },
        setSignedIn:(signedIn:boolean) => {
            dispatch(Actions.setSignedIn(signedIn))
        },
    }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SigninController));