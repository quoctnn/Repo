import * as React from 'react'
import { withRouter, RouteComponentProps} from 'react-router-dom'
import { connect } from 'react-redux'
import { ReduxState } from '../../redux'
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import "./ApplicationLoader.scss"
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { NotificationCenter } from '../../utilities/NotificationCenter';
import { ApplicationManagerLoadingProgressNotification, LoadingProgress } from '../../managers/ApplicationManager';

interface OwnProps {
    
}
interface ReduxStateProps{
    loaded:boolean
}
type Props = RouteComponentProps<any> & ReduxStateProps & OwnProps
class ApplicationLoader extends React.Component<Props, {}> {

    observers:any[] = []
    constructor(props:Props) {
        super(props);
        const observer = NotificationCenter.addObserver(ApplicationManagerLoadingProgressNotification, this.processProgressUpdate)
        this.observers.push(observer)
    }
    processProgressUpdate = (...args:any[]) => {
        let progress = args[0] as LoadingProgress;
        console.log("progress: ", progress.percent, progress.text)
    }
    componentWillUnmount = () => {
        this.observers.forEach(o => o.remove())
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