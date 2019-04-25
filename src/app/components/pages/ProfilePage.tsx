import * as React from "react";
import { connect } from 'react-redux'
import "./ProfilePage.scss"
import { UserProfile } from "../../types/intrasocial_types";
import LoadingSpinner from "../LoadingSpinner";
import { ReduxState } from "../../redux";
import PageHeader from "../PageHeader";
import { DashboardWithData } from "../../DashboardWithData";
import { Error404 } from '../../views/error/Error404';
import { ProfileManager } from "../../managers/ProfileManager";
import { userCover, userAvatar, userFullName } from "../../utilities/Utilities";
export interface OwnProps 
{
    match:any,
}
interface ReduxStateProps 
{
    profile:UserProfile
}
interface ReduxDispatchProps 
{
}
interface State 
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class ProfilePage extends React.Component<Props, State> 
{
    constructor(props:Props) {
        super(props);
        this.state = {
            loading:false
        }
    }
    renderLoading = () => 
    {
        return (<LoadingSpinner />)
    }
    renderHeader(profile:UserProfile)
    {
        return (
                <PageHeader coverImage={userCover(profile)} primaryItemImage={userAvatar(profile, true)} primaryItemTitle={userFullName(profile)}  />
            )
    }
    renderNotFound = () => {
        return <Error404 />
    }
    render() {
        const {profile} = this.props
        const hasData = !!profile
        return(
            <div id="project-page" className="dashboard-container">
                {!hasData && this.renderNotFound()}
                {hasData && 
                    <div className="content dashboard-container">
                        {this.renderHeader(profile)}
                        <DashboardWithData category="profile" />
                    </div>
                }
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps:OwnProps) => {
    const profileid:string = ownProps.match.params.profilename
    const profile = ProfileManager.getProfile(profileid)
    return {
        profile,
    }
}
export default connect<ReduxStateProps, null, OwnProps>(mapStateToProps, null)(ProfilePage);