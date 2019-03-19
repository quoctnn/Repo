import "intersection-observer"
import * as React from "react";
import { Route, Switch, withRouter, RouteComponentProps } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import Routes from "./utilities/Routes";
import { connect } from 'react-redux'
import "./Main.scss"
import { DashCompWithData } from "./Dashboard";
import { ReduxState } from "./redux";
import Signin from "./views/signin/Signin";
import { error404 } from "./views/error/error404";
import NewsfeedPage from "./components/pages/NewsfeedPage";
import { Dashboard } from './types/intrasocial_types';
import ApplicationLoader from "./views/loading/ApplicationLoader";
import Signout from "./views/signout/Signout";

type OwnProps = {
}
type ReduxStateProps = {
    signedIn:boolean
    loaded:boolean
}
type ReduxDispatchProps = {
}
type State = {
    dashboards:Dashboard[]
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class Main extends React.Component<Props, State> {
    previousLocation:any
    constructor(props:Props)
    {
        super(props)
        this.state = {
            dashboards:[]
        }
    }
    componentWillReceiveProps(nextProps) {
        this.previousLocation = this.props.location;
    }
    render() {
        return(
            <div id="main">
                    <div id="main-content">
                        <ToastContainer />
                        <div id="content-block" className="">
                            {!this.props.loaded &&
                                <Switch>
                                    <Route path={Routes.ANY} component={ApplicationLoader} />
                                </Switch>
                            }
                            {this.props.loaded &&
                                <Switch>
                                    <Route path={Routes.newsfeedUrl(":contextNaturalKey?", ":contextObjectId?")} component={NewsfeedPage} />
                                    <Route path={Routes.SIGNIN} component={Signin} />
                                    <Route path={Routes.SIGNOUT} component={Signout} />
                                    <Route path={Routes.ROOT} exact={true} component={DashCompWithData} />
                                    <Route path={Routes.ANY} component={error404} />
                                </Switch>
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
      loaded:state.application.loaded
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, null)(Main))