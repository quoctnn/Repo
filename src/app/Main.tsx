import * as React from "react";
import { Route, Switch, withRouter, RouteComponentProps } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import Routes from "../utilities/Routes";
import { connect } from 'react-redux'
import "./Main.scss"
import { DashCompWithData } from "./Dashboard";
import { ReduxState } from "./redux";
import Signin from "./views/signin/Signin";
import { error404 } from "./views/error/error404";
import { Transition  } from 'react-transition-group';
const DEMO = (props:any) => {
    return (<div>DEMO</div>)
}

interface OwnProps
{
}
interface ReduxStateProps
{
  signedIn:boolean
}
interface ReduxDispatchProps
{
}
interface State
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class Main extends React.Component<Props, State> {
    previousLocation:any
    constructor(props:Props)
    {
        super(props)

    }
    componentWillReceiveProps(nextProps) {
        this.previousLocation = this.props.location;
    }
    render() {
        const { location } = this.props;
        const modal = location.state && location.state.to == "modal"
        const prevModal = this.previousLocation && this.previousLocation.state && this.previousLocation.state.to === "modal"
        let pos = {};
        if(modal){
            pos = location.state.meta.from;
        }
        if(prevModal)
        {
            pos = this.previousLocation.state.meta.from;
        }
        const modalLocation = modal ? location : (this.previousLocation || location)
        console.log("modal", modal)
        return(
            <div id="main">
                    <div id="main-content">
                        <ToastContainer />
                        <div id="content-block" className="">
                        {!this.props.signedIn &&
                              <Switch>
                                <Route path={Routes.ANY} component={Signin} />
                                </Switch>
                            }
                            {this.props.signedIn &&
                                <>
                                    <Switch location={modal ? this.previousLocation : location}>
                                        <Route path={Routes.SIGNIN} component={Signin} />
                                        <Route path={Routes.ROOT} exact={true} component={DashCompWithData} />
                                        <Route path={Routes.ANY} component={error404} />
                                    </Switch>
                                    <Transition key={modalLocation.pathname} unmountOnExit={true} mountOnEnter={true} appear={true} in={modal} timeout={{
                                        enter: 100,
                                        exit: 450,
                                    }} >
                                    {
                                        (status) => (
                                            
                                            <div className={`modal-container modal-${status}`} style={pos}>
                                                <Switch location={modalLocation}>
                                                    <Route path="/recipe/:id" component={DEMO} />
                                                </Switch>
                                            </div>
                                    )}
                                    </Transition>
                                </>
                            }
                        </div>
                    </div>
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
    return {
      signedIn:state.authentication.signedIn,
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, null)(Main))