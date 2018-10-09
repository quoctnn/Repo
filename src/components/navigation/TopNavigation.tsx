import { Routes } from '../../utilities/Routes';
import * as React from 'react';
import ProfileStatus from "../general/ProfileStatus";
import {Settings} from "../../utilities/Settings"
import { DevToolTrigger } from '../dev/DevToolTrigger';
import { Link} from 'react-router-dom'
import UserStatusSelector from '../general/UserStatusSelector';
import { connect } from 'react-redux'
import { RootState } from '../../reducers/index';
import { ApiEndpoint } from '../../reducers/debug';
require("./TopNavigation.scss");
export interface OwnProps
{

}
interface ReduxStateProps {
    signedIn:boolean
    apiEndpoint?:number
    availableApiEndpoints?:Array<ApiEndpoint>
}

type Props = ReduxStateProps & OwnProps
class TopNavigation extends React.Component<Props, {}> {
    render() {
        var endpoint = ""
        if (this.props.availableApiEndpoints && this.props.apiEndpoint != null) {
            endpoint = this.props.availableApiEndpoints[this.props.apiEndpoint].endpoint
            endpoint = endpoint.replace(/(^\w+:|)\/\//, '');
            endpoint = endpoint.replace(/(:\d+$)/, '');
        }
        return(
            <div id="top-navigation" className="d-flex align-items-center">
                <div className="flex-shrink-0">
                    <Link className="btn btn-primary margin-right-sm" to={Routes.ROOT}><i className="fas fa-home" /></Link>
                    <Link className="btn btn-primary margin-right-sm" to={Routes.CONVERSATIONS}><i className="fas fa-comments" /></Link>
                </div>
                { endpoint &&
                    <div className="text-truncate align-items-center lead">{endpoint}</div>
                }
                <div className="flex-grow-1 flex-shrink-1"></div>
                <div className="d-flex">
                    {!Settings.isProduction && <DevToolTrigger /> }
                    {this.props.signedIn && <UserStatusSelector /> }
                    <ProfileStatus />
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {
    return {
        signedIn:state.auth.signedIn,
        apiEndpoint: state.debug.apiEndpoint,
        availableApiEndpoints: state.debug.availableApiEndpoints,
    }
  }
  export default connect<ReduxStateProps, void, OwnProps>(mapStateToProps, null)(TopNavigation);