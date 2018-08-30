import * as React from "react";
import { connect } from 'react-redux'
import { UserProfile } from '../../reducers/profileStore';
import { CoverImage } from '../../components/general/CoverImage';
import { RootReducer } from '../../reducers/index';
require("./Profile.scss");

export interface Props {
    match:any,
    profile:UserProfile,
    profiles:UserProfile[]
}

class Profile extends React.Component<Props, {}> {
    getProfile(slug:string)
    {
        if(this.props.profile && this.props.profile.slug_name == slug)
            return this.props.profile
        return this.props.profiles.find((c) => c.slug_name == slug)
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
    render() {
        let slug = this.props.match.params.slug
        let profile = this.getProfile(slug)
        return(
            <div id="profile-view">
            {profile && this.renderProfile(profile)}
            {!profile && <div>NO PROFILE</div>}
            </div>
        );
    }
}
const mapStateToProps = (state:RootReducer) => {
    return {
        profiles:state.profileStore.profiles, 
        profile:state.profile
    };
}
export default connect(mapStateToProps, null)(Profile);