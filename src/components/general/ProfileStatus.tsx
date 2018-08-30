import * as React from "react";
import { translate } from '../intl/AutoIntlProvider';
import { withRouter, Link} from 'react-router-dom'
import { connect } from 'react-redux'
import { Button} from 'reactstrap';
import * as Actions from "../../actions/Actions"
import { History} from 'history'
import { Routes } from '../../utilities/Routes';
import { UserProfile } from '../../reducers/profileStore';
import { RootReducer } from '../../reducers/index';
require("./ProfileStatus.scss");

export interface Props {
    profile?:UserProfile,
    signOut:() => void,
    history:History,
    language:number,
}

class ProfileStatus extends React.Component<Props, {}> {

    render() 
    {
        return(
            <div id="profile-status">
                {!this.props.profile && 
                    <div className="">
                        <Link className="btn btn-outline-secondary" to={Routes.SIGNIN}>{translate("Sign in")}</Link>
                    </div>
                }
                {this.props.profile && 
                    <div className="flex align-center">
                        <div className="">
                        <Link className="btn btn-outline-secondary" to={Routes.PROFILES + this.props.profile.slug_name}>{this.props.profile.first_name}</Link>
                        </div>
                        <div className="margin-left-sm">
                            <Button onClick={() => {this.props.signOut(); this.props.history.push(Routes.ROOT) }} outline color="secondary">{translate("Sign out")}</Button>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

const mapStateToProps = (state:RootReducer) => {
    return {
        profile:state.profile, 
        language: state.settings.language,
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        signOut:() => {
            dispatch(Actions.setProfile(null))
            dispatch(Actions.setSignedIn(false))
            dispatch(Actions.setAuthorizationData(null, null))
            dispatch(Actions.resetCommunityStore())
            dispatch(Actions.resetGroupStore())
            dispatch(Actions.resetCommunityGroupsCache())
            dispatch(Actions.resetProfileStore());

        }
        
    }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProfileStatus));