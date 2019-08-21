import * as React from 'react'
import { withRouter, RouteComponentProps, Link} from 'react-router-dom'
import { connect } from 'react-redux'
import { AuthenticationManager } from '../../managers/AuthenticationManager'
import { ReduxState } from '../../redux'
import "./Signout.scss"
import { translate } from '../../localization/AutoIntlProvider';
import Routes from '../../utilities/Routes';

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
            this.props.history.push('/');
        }
    }
    componentDidMount = () => {
        if(this.props.signedIn)
        {
            this.setState({signedOut:true}, AuthenticationManager.signOut)
        } else {
            this.props.history.push('/');
        }
    }
    render = () => {
        const text = translate(this.props.signedIn ? "common.signing.out" : "common.signed.out" )
        return(
            <div className="m-5 text-center" id="sign-out">
                <div>{text}</div>
                <div>
                    {!this.props.signedIn && <Link className="btn btn-sm btn-secondary" to={Routes.ROOT}>{translate("common.home")}</Link>}
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