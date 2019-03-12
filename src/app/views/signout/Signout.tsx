import * as React from 'react'
import { withRouter, RouteComponentProps} from 'react-router-dom'
import { connect } from 'react-redux'
import { AuthenticationManager } from '../../managers/AuthenticationManager'
import { ReduxState } from '../../redux'
import "./Signout.scss"
import { translate } from '../../localization/AutoIntlProvider';

type OwnProps = {
    
}
type ReduxStateProps = {
    apiEndpoint?:number,
    language:number,
}
type Props = RouteComponentProps<any> & ReduxStateProps & OwnProps
class Signout extends React.Component<Props, {signedOut:boolean}> {

    constructor(props:Props) {
        super(props);
        this.state = {
            signedOut:false
        }
    }
    componentDidMount = () => {
        setTimeout(() => {
            this.setState({signedOut:true}, AuthenticationManager.signOut)
        }, 1000);
    }
    doSignout = (e) => {
        
        e.preventDefault()
        AuthenticationManager.signOut()
    }
    render = () => {
        const text =  translate(this.state.signedOut ? "Signed out" : "Signing out") 
        return(
            <div id="sign-out">
                {text}
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
export default withRouter(connect(mapStateToProps, null)(Signout));