import * as React from 'react'
import { withRouter, RouteComponentProps} from 'react-router-dom'
import { connect } from 'react-redux'
import { ReduxState } from '../../redux'
import { ApplicationManager } from '../../managers/ApplicationManager';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import "./ApplicationLoader.scss"
import { AuthenticationManager } from '../../managers/AuthenticationManager';

interface OwnProps {
    
}
interface ReduxStateProps{
    loaded:boolean
}
type Props = RouteComponentProps<any> & ReduxStateProps & OwnProps
class ApplicationLoader extends React.Component<Props, {}> {

    constructor(props:Props) {
        super(props);
    }
    componentDidMount = () => {

        AuthenticationManager.signInCurrent()
    }
    renderLoading = () => {
        if (!this.props.loaded) {
            return (<CircularLoadingSpinner size={50} borderWidth={6}  key="loading"/>)
        }
    }
    render() {
        return(
            <div id="application-loader">
                {this.renderLoading()}
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState):ReduxStateProps => {
    return {
        loaded:state.application.loaded
    };
}
export default withRouter(connect(mapStateToProps, null)(ApplicationLoader));