import * as React from 'react'
import { withRouter, RouteComponentProps} from 'react-router-dom'
import { connect } from 'react-redux'
import { ReduxState } from '../../redux'
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import "./ApplicationLoader.scss"
import { NotificationCenter } from '../../utilities/NotificationCenter';
import { ApplicationManagerLoadingProgressNotification, LoadingProgress } from '../../managers/ApplicationManager';
import Logo from '../../components/general/images/Logo';
import { translate } from '../../localization/AutoIntlProvider';
import { EventSubscription } from 'fbemitter';

interface OwnProps {
    
}
interface ReduxStateProps{
    loaded:boolean
}
type Props = RouteComponentProps<any> & ReduxStateProps & OwnProps
class ApplicationLoader extends React.Component<Props, {progress:LoadingProgress}> {

    observers:EventSubscription[] = []
    constructor(props:Props) {
        super(props);
        const observer = NotificationCenter.addObserver(ApplicationManagerLoadingProgressNotification, this.processProgressUpdate)
        this.observers.push(observer)
        this.state = {
            progress:{percent:0, text:""}
        }
    }
    processProgressUpdate = (...args:any[]) => {
        let progress = args[0] as LoadingProgress;
        console.log("progress: ", progress.percent, progress.text)
        this.setState({progress:progress})
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
                <div className="left"></div>
                <div className="right"></div>
                <svg className="wave" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                    <defs>
                        <linearGradient id="Gradient1" x1="0" x2="0" y1="0" y2="1">
                            <stop className="stop1" offset="0%"/>
                            <stop className="stop2" offset="100%"/>
                        </linearGradient>
                    </defs>
                    <path d="M0,00 L60,00 C80,50 30,55 45,100 L0,100z" fill="url(#Gradient1)" />
                </svg>
                <div className="splash-content">
                    <div className="splash-title">{translate("splash.title")}</div>
                    <Logo className="logo" progress={this.state.progress.percent} />
                    <div className="splash-subtitle">{translate("splash.subtitle")}</div>
                </div>
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