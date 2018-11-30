import * as React from "react";
import { connect } from 'react-redux'
import {getProfileIdBySlugName } from '../../reducers/profileStore';
import { CoverImage } from '../../components/general/CoverImage';
import { RootState } from '../../reducers/index';
import ApiClient from '../../network/ApiClient';
import * as Actions from '../../actions/Actions'; 
import LoadingSpinner from '../../components/general/LoadingSpinner';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { UserProfile } from "../../types/intrasocial_types";
require("./Profile.scss");

export interface Props {
    match:any,
    user:UserProfile,
    storeProfiles: (profiles:UserProfile[]) => void
}
export interface State {
    loading:boolean,
    slug:string
}
class Profile extends React.Component<Props, {}> 
{
    state:State
    constructor(props)
    {
        super(props)
        this.state = { loading:false, slug:null}
        this.loadDataFromServerIfNeeded = this.loadDataFromServerIfNeeded.bind(this)
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
    fetchProfile()
    {
        let slug = this.props.match.params.slug
        ApiClient.getProfileBySlug(slug, (data:{results:UserProfile[]},status,error) => 
        {
            if(data && data.results && data.results.length > 0)
            {
                this.props.storeProfiles(data.results)
            }
            this.setState({loading:false})
        })
    }
    loadDataFromServerIfNeeded()
    {
        let profile = this.props.user
        if(!this.state.loading && !profile && this.state.slug != this.props.match.params.slug)
        {
            this.setState({loading:true, slug:this.props.match.params.slug}, this.fetchProfile)
        }
    }
    componentDidUpdate()
    {
        this.loadDataFromServerIfNeeded()
    }
    componentDidMount()
    {
        this.loadDataFromServerIfNeeded()
    }
    renderLoading() {
        if (this.state.loading) {
            return (<LoadingSpinner/>)
        }
    }
    render() {
        let profile = this.props.user
        return(
            <div id="profile-view" className="col-sm">
                {this.renderLoading()}
                {profile && this.renderProfile(profile)}
                {!profile && this.state.slug && !this.state.loading && <div>No Profile Found</div>}
            </div>
        );
    }
}
const mapStateToProps = (state:RootState, ownProps:Props) => {
    let slug = ownProps.match.params.slug
    const me = AuthenticationManager.getAuthenticatedUser()
    let isMe = me && me.slug_name == slug || false
    if(isMe)
    {
        return {user: me}
    }
    else 
    {
        let id = getProfileIdBySlugName(slug, state)
        if(id)
        {
            return {user: state.profileStore.byId[id]} 
        }
        return {user: null}
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        storeProfiles: (profiles:UserProfile[]) => {
            dispatch(Actions.storeProfiles(profiles));
        },
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Profile);
