import * as React from "react";
import { translate } from '../intl/AutoIntlProvider';
import { withRouter, Link} from 'react-router-dom'
import { connect } from 'react-redux'
import { Button} from 'reactstrap';
import * as Actions from "../../actions/Actions"
import { Routes } from '../../utilities/Routes';
import { UserProfile } from '../../reducers/profileStore';
import { RootState } from '../../reducers/index';
require("./ProfileStatus.scss");

export interface OwnProps 
{
}
interface RouteProps 
{
    history:any
    location: any
    match:any
}
interface ReduxStateProps 
{
    authenticatedProfile:UserProfile,
    language:number,
}
interface ReduxDispatchProps 
{
    signOut:() => void,
}
interface State 
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteProps
class ProfileStatus extends React.Component<Props, State> {

    render() 
    {
        return(
            <div id="profile-status">
                {!this.props.authenticatedProfile && 
                    <div className="">
                        <Link className="btn btn-outline-secondary" to={Routes.SIGNIN}>{translate("Sign in")}</Link>
                    </div>
                }
                {this.props.authenticatedProfile && 
                    <div className="d-flex align-items-center">
                        <div className="">
                        <Link className="btn btn-outline-secondary" to={Routes.PROFILES + this.props.authenticatedProfile.slug_name}>{this.props.authenticatedProfile.first_name}</Link>
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
const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {
    return {
        authenticatedProfile:state.auth.profile, 
        language: state.settings.language,
    }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {
        signOut:() => {
            dispatch(Actions.setSignedInProfile(null))
            dispatch(Actions.setSignedIn(null))
            dispatch(Actions.setAuthorizationData(null, null))
            dispatch(Actions.resetCommunityStore())
            dispatch(Actions.resetGroupStore())
            dispatch(Actions.resetCommunityGroupsCache())
            dispatch(Actions.resetProfileStore());

        }
        
    }
}
export default withRouter<RouteProps>(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ProfileStatus));