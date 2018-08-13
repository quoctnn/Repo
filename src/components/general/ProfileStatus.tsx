import * as React from "react";
import {injectIntl, InjectedIntlProps} from "react-intl";
import Intl from "../../utilities/Intl"
import { withRouter, Link} from 'react-router-dom'
import { connect } from 'react-redux'
import { Button} from 'reactstrap';
import * as Actions from "../../actions/Actions"
import { History} from 'history'
import { Routes } from '../../utilities/Routes';
require("./ProfileStatus.scss");

export interface Props {
    profile?:any,
    signOut:() => void,
    history:History,
}

class ProfileStatus extends React.Component<Props & InjectedIntlProps, {}> {

    render() 
    {
        return(
            <div id="profile-status">
                {!this.props.profile && 
                    <div className="">
                        <Link className="btn btn-outline-secondary" to={Routes.SIGNIN}>{Intl.translate(this.props.intl, "Sign in")}</Link>
                    </div>
                }
                {this.props.profile && 
                    <div className="flex align-center">
                        <div className="">
                        <Link className="btn btn-outline-secondary" to={Routes.PROFILE_UPDATE}>{this.props.profile.first_name}</Link>
                        </div>
                        <div className="margin-left-sm">
                            <Button onClick={() => {this.props.signOut(); this.props.history.push(Routes.ROOT) }} outline color="secondary">{Intl.translate(this.props.intl, "Sign out")}</Button>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        profile:state.profile, 
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        signOut:() => {
            dispatch(Actions.setProfile(null))
            dispatch(Actions.setSignedIn(false))
            dispatch(Actions.setAuthorizationData(null))
        }
        
    }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(injectIntl(ProfileStatus)));