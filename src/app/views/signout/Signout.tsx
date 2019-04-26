import * as React from 'react'
import { withRouter, RouteComponentProps, Link} from 'react-router-dom'
import { connect } from 'react-redux'
import { AuthenticationManager } from '../../managers/AuthenticationManager'
import { ReduxState } from '../../redux'
import "./Signout.scss"
import { translate } from '../../localization/AutoIntlProvider';
import Routes from '../../utilities/Routes';
import { timeout } from 'q';

type OwnProps = {

}
type ReduxStateProps = {
    apiEndpoint?:number,
    language:number,
    signedIn:boolean
}
type Props = RouteComponentProps<any> & ReduxStateProps & OwnProps
class Signout extends React.Component<Props, {signedOut:boolean}> {

    constructor(props:Props) {
        super(props);
        this.state = {
            signedOut:false
        }
    }
    componentDidUpdate = () => {
        if (this.state.signedOut) {
            this.timedRedirect()
        }
    }
    componentDidMount = () => {
        if(this.props.signedIn)
        {
            setTimeout(() => {
                this.setState({signedOut:true}, AuthenticationManager.signOut)
            }, 1000);
        } else {
            this.timedRedirect()
        }
    }
    timedRedirect = () => {
        setTimeout(() => {
            window.location.replace(Routes.ROOT)
        }, 3000);
    }
    render = () => {
        const text = translate(this.props.signedIn ? "Signing out" : "Signed out, redirecting to home..." )
        return(
            <div className="m-5 text-center" id="sign-out">
                <div>{text}</div>
                <div>
                    {!this.props.signedIn && <Link className="btn btn-sm btn-secondary btn-outline-secondary" to={Routes.ROOT}>{translate("Home")}</Link>}
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState):ReduxStateProps => {
    return {
        apiEndpoint:state.endpoint.endpoint,
        language: state.language.language,
        signedIn: state.authentication.signedIn
    };
}
export default withRouter(connect(mapStateToProps, null)(Signout));