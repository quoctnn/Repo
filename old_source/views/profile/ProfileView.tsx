import * as React from "react";
import { connect } from 'react-redux'
import {getProfileIdBySlugName } from '../../reducers/profileStore';
import { CoverImage } from '../../components/general/CoverImage';
import { RootState } from '../../reducers/index';
import ApiClient from '../../network/ApiClient';
import LoadingSpinner from '../../components/general/LoadingSpinner';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { UserProfile } from "../../types/intrasocial_types2";
import { ProfileManager } from "../../managers/ProfileManager";
require("./ProfileView.scss");

export interface OwnProps 
{
    match:any,
}
interface ReduxStateProps 
{
    profile:UserProfile|null
    id:number
}
interface ReduxDispatchProps 
{
}
interface State 
{
    loading:boolean
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class ProfileView extends React.Component<Props, State> 
{
    constructor(props) {
        super(props);
        this.state = {
            loading:false
        }
    }
    componentDidMount = () => {
        if(!this.props.profile)
        {
            this.setState({loading:true}, () => {
                ProfileManager.ensureProfilesExists([this.props.id], () => {
                    this.setState({loading:false})
                })
            })
            
        }
    }
    renderProfile(profile:UserProfile)
    {
        return (
        <div className="content">
            <CoverImage src={profile.cover || profile.cover_cropped}>
                <div className="down-shadow profile-name text-truncate">
                    <h2 className="text-truncate">{profile.first_name + " " + profile.last_name}</h2>
                </div>
            </CoverImage> 
        </div>)
    }
    renderLoading() {
        if (this.state.loading) {
            return (<LoadingSpinner/>)
        }
    }
    render() {
        let profile = this.props.profile
        return(
            <div id="profile-view" className="col-sm">
                {this.renderLoading()}
                {profile && this.renderProfile(profile)}
                {!profile && <div>NO PROFILE</div>}
            </div>
        );
    }
}
const mapStateToProps = (state:RootState, ownProps:OwnProps) => {
    var profileid = ownProps.match.params.slug
    const profile = ProfileManager.getProfile(profileid)
    return {
        profile,
        id:profileid
    }
}
export default connect(mapStateToProps, null)(ProfileView);
