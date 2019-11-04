import * as React from "react";
import { connect, DispatchProp } from 'react-redux'
import "./ProfileDetailsModule.scss"
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../../components/general/observers/ResponsiveComponent";
import Module, { CommonModuleProps } from "../../Module";
import { ReduxState } from "../../../redux";
import { ContextManager } from "../../../managers/ContextManager";
import { withRouter, RouteComponentProps } from "react-router";
import { UserProfile, ContextNaturalKey, ProfilePosition, ElasticSearchType, RelationshipStatus } from "../../../types/intrasocial_types";
import { userFullName, stringToDate, uniqueId } from '../../../utilities/Utilities';
import ModuleContent from "../../ModuleContent";
import ModuleHeader from "../../ModuleHeader";
import ModuleFooter from '../../ModuleFooter';
import {ApiClient} from "../../../network/ApiClient";
import { translate } from "../../../localization/AutoIntlProvider";
import { AuthenticationManager } from '../../../managers/AuthenticationManager';
import StackedAvatars from "../../../components/general/StackedAvatars";
import { Link } from "react-router-dom";
import { Moment } from "moment-timezone";
import Routes from '../../../utilities/Routes';
import { OverflowMenuItem, OverflowMenuItemType } from '../../../components/general/OverflowMenu';
import ProfileUpdateComponent from "../../../components/general/contextCreation/ProfileUpdateComponent"
import moment = require("moment");
import { DropDownMenu } from "../../../components/general/DropDownMenu";
import { ToastManager } from '../../../managers/ToastManager';
import { ProfileManager } from '../../../managers/ProfileManager';
import { withContextData, ContextDataProps } from "../../../hoc/WithContextData";

type TimezoneInfoProps = {
    timezone:string
}
type TimezoneInfoState = {
    time:Moment
}
class TimezoneInfo extends React.PureComponent<TimezoneInfoProps, TimezoneInfoState> {
    private interval:NodeJS.Timer = null
    constructor(props:TimezoneInfoProps){
        super(props)
        this.state = {
            time: moment().clone().tz(this.props.timezone)
        }
    }
    componentDidMount = () => {
        this.interval = setInterval(() => {
            this.setState((prevState:TimezoneInfoState) => {
                return {time:moment().clone().tz(this.props.timezone)}
            })
        }, 1000)
    }
    componentWillUnmount = () => {
        if(this.interval)
        {
            clearInterval(this.interval)
            this.interval = null
        }
    }
    render = () => {
        return <div className="timezone-info">
                {this.state.time.format("[GMT] Z [- " + translate("Now") + "] LT")}
                </div>
    }
}

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps & DispatchProp
type ReduxStateProps = {
    authenticatedProfile:UserProfile
}
type ReduxDispatchProps ={
}
type State = {
    latestJob:ProfilePosition
    isLoading:boolean
    loadedProfileId:number
    editFormVisible:boolean
    editFormReloadKey?:string
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any> & ContextDataProps
class ProfileDetailsModule extends React.PureComponent<Props, State> {
    constructor(props:Props) {
        super(props)
        this.state = {
            latestJob:null,
            isLoading:false,
            loadedProfileId:null,
            editFormVisible:false,
            editFormReloadKey:uniqueId(),
        }
    }
    componentDidMount = () => {
        this.fetchData()
    }
    componentDidUpdate = () => {
        this.fetchData()
    }
    fetchData = () => {
        const {loadedProfileId, isLoading} = this.state
        const profileId = this.props.contextData.profile && this.props.contextData.profile.id
        if(!profileId || loadedProfileId == profileId || isLoading)
            return
        this.setState((prevState:State) => {
            return {isLoading:true, latestJob:null}
        }, () => {
            console.log("fetching positions")
            ApiClient.getPositions(10, 0, profileId,(data, status, error) => {
                const position = (data && data.results || []).filter(p => !p.end_date).sort((a,b) => (a.start_date && stringToDate(a.start_date).valueOf() || 0) - (b.start_date && stringToDate(b.start_date).valueOf() || 0))[0]
                this.setState((prevState:State) => {
                    return {latestJob:position, isLoading:false, loadedProfileId:profileId}
                })
            })
        })
    }
    blockUser = (event: React.SyntheticEvent<any>) => {
        const p = this.props.contextData.profile
        const profile:UserProfile = {...p, relationship:p.relationship.map(i => i)}
        ApiClient.userBlock(profile.id, (data, status, error) => {
            if(!error)
            {
                const relationship =  profile.relationship || []
                relationship.push(RelationshipStatus.isBlocked)
                relationship.remove(RelationshipStatus.friends)
                relationship.remove(RelationshipStatus.pendingInvitation)
                relationship.remove(RelationshipStatus.pendingRequest)
                profile.relationship = relationship
                this.updateProfile(profile)
            }
            ToastManager.showRequestErrorToast(error)
        })
    }
    unBlockUser = (event: React.SyntheticEvent<any>) => {
        const p = this.props.contextData.profile
        const profile:UserProfile = {...p, relationship:p.relationship.map(i => i)}
        ApiClient.userUnBlock(profile.id, (data, status, error) => {
            if(!error)
            {
                const relationship =  profile.relationship || []
                relationship.remove(RelationshipStatus.isBlocked)
                profile.relationship = relationship
                this.updateProfile(profile)
            }
            ToastManager.showRequestErrorToast(error)
        })
    }
    unfriendUser = (event: React.SyntheticEvent<any>) => {
        const p = this.props.contextData.profile
        const profile:UserProfile = {...p, relationship:p.relationship.map(i => i)}
        ApiClient.userUnfriend(profile.id, (data, status, error) => {
            if(!error)
            {
                const relationship =  profile.relationship || []
                relationship.remove(RelationshipStatus.friends)
                profile.relationship = relationship
                this.updateProfile(profile)
            }
            ToastManager.showRequestErrorToast(error)
        })
    }
    sendInvitationToUser = () => (event: React.SyntheticEvent<any>) => {
        const p = this.props.contextData.profile
        const profile:UserProfile = {...p, relationship:p.relationship.map(i => i)}
        ApiClient.friendInvitationSend(profile.id, (data, status, error) => {
            if(data)
            {
                const relationship =  profile.relationship || []
                relationship.push(RelationshipStatus.pendingRequest)
                profile.relationship = relationship
                this.updateProfile(profile)
            }
            ToastManager.showRequestErrorToast(error)
        })
    }
    acceptInvitationFromUser = () => (event: React.SyntheticEvent<any>) => {
        const p = this.props.contextData.profile
        const profile:UserProfile = {...p, relationship:p.relationship.map(i => i)}
        ApiClient.friendInvitationAccept(profile.id, (data, status, error) => {
            if(!error)
            {
                const relationship =  profile.relationship || []
                relationship.push(RelationshipStatus.friends)
                relationship.remove(RelationshipStatus.pendingInvitation)
                profile.relationship = relationship
                this.updateProfile(profile)
            }
            ToastManager.showRequestErrorToast(error)
        })
    }
    updateProfile = (profile:UserProfile) => {
        profile.last_seen = new Date().getTime()
        ProfileManager.storeProfile(profile)
    }
    declineInvitationFromUser = (toRemove:RelationshipStatus) => (event: React.SyntheticEvent<any>) => {
        const p = this.props.contextData.profile
        const profile:UserProfile = {...p, relationship:p.relationship.map(i => i)}
        ApiClient.friendInvitationDelete(profile.id, false, (data, status, error) => {
            if(!error)
            {
                const relationship =  profile.relationship || []
                relationship.remove(toRemove)
                profile.relationship = relationship
                this.updateProfile(profile)
            }
            ToastManager.showRequestErrorToast(error)
        })
    }
    renderTimezoneInfo = () => {
        if(this.props.contextData.profile && this.props.contextData.profile.timezone)
            return <TimezoneInfo timezone={this.props.contextData.profile.timezone} />
        return null
    }
    renderConnections = () => {
        const {authenticatedProfile} = this.props
        const {profile} = this.props.contextData
        if(profile && authenticatedProfile)
        {
            let connections:number[] = []
            let numberOfConnections = 0
            if(profile.id == authenticatedProfile.id)
            {
                connections = authenticatedProfile.connections.slice(0, 5)
                numberOfConnections = authenticatedProfile.connections.length
            }
            else {
                connections = profile.mutual_contacts.ids
                numberOfConnections = profile.mutual_contacts.count
            }
            if(connections.length > 0)
            {
                return  <div className="d-flex justify-content-between align-items-center">
                             <div className="d-flex flex-column mw0">
                                <div className="text-truncate">
                                    {translate("Connections")}
                                </div>
                                <div className="text-truncate">
                                    {`${numberOfConnections} ${translate("People")}`}
                                </div>
                            </div>
                            <div className="d-flex flex-column align-items-end">
                                <Link to={{pathname:Routes.SEARCH, state:{modal:true}, search:"type=" + ElasticSearchType.USER}}>{translate("common.see.all")}</Link>
                                <StackedAvatars userIds={connections} />
                            </div>
                        </div>
            }
        }
        return null
    }
    renderCommonFriends = () => {

        const {authenticatedProfile} = this.props
        const {profile} = this.props.contextData
        if(profile && authenticatedProfile && profile.id != authenticatedProfile.id)
            return <div className="medium-small-text">{translate("profile.friends.common.count").format(profile.mutual_friends.length)}</div>
        return null
    }
    renderContent = () => {
        const position = this.state.latestJob
        return <>
                {position && <div className="latest-position">{position.name}{" "}{translate("at")}{" "}{position.company && position.company.name || position.company}</div>}
                {this.renderConnections()}
                {this.renderCommonFriends()}
                {this.renderTimezoneInfo()}
                </>
    }
    renderEditForm = () => {
        const visible = this.state.editFormVisible
        const {profile} = this.props.contextData
        return <ProfileUpdateComponent onCancel={this.hideProfileUpdateForm} key={this.state.editFormReloadKey} profile={profile} visible={visible} onComplete={this.handleProfileUpdateForm} />
    }
    showProfileUpdateForm = () => {
        this.setState((prevState:State) => {
            return {editFormVisible:true, editFormReloadKey:uniqueId()}
        })
    }
    hideProfileUpdateForm = () => {

        this.setState((prevState:State) => {
            return {editFormVisible:false}
        })
    }
    handleProfileUpdateForm = (profile:UserProfile) => {
        if(!!profile)
        {
            AuthenticationManager.setUpdatedProfileStatus(profile)
        }
        this.hideProfileUpdateForm()
    }

    getProfileOptions = () => {
        const options: OverflowMenuItem[] = []
        const {profile} = this.props.contextData
        if(!profile)
            return options
        if (this.props.authenticatedProfile.id == profile.id) {
            options.push({id:"1", type:OverflowMenuItemType.option, title:translate("Edit"), onPress:this.showProfileUpdateForm, iconClass:"fas fa-pen"})
        }
        else{
            const relationship = profile.relationship && profile.relationship || []
            // TODO: Check if user is already blocked and have unblock instead
            if (relationship.contains(RelationshipStatus.isBlocked)) {
                options.push({
                    id: "unblock",
                    type: OverflowMenuItemType.option,
                    title: translate("common.relationship.unblock"),
                    onPress: this.unBlockUser,
                    toggleMenu: false
                })
            } else {
                options.push({
                    id: "block",
                    type: OverflowMenuItemType.option,
                    title: translate("common.relationship.block"),
                    onPress: this.blockUser,
                    toggleMenu: false
                })
            }
            if (profile.relationship && profile.relationship.contains(RelationshipStatus.friends)) {
                options.push({
                    id: "unfriend",
                    type: OverflowMenuItemType.option,
                    title: translate("common.relationship.unfriend"),
                    onPress: this.unfriendUser,
                    toggleMenu: false
                })
            }
        }
        return options
    }
    renderFriendshipStatus = (relationship:RelationshipStatus) => {
        if(!relationship)
            return null
        return <div className='relationship'>
                {translate(`common.relationship.${relationship}`)}
            </div>
    }
    renderFriendshipButtons = (relationship:RelationshipStatus) => {
        if(relationship == RelationshipStatus.blockedBy)
        {
            return null
        }
        switch(relationship) {
            case RelationshipStatus.friends:
            case RelationshipStatus.isBlocked:
                return
            case RelationshipStatus.pendingInvitation:
                return (
                    <>
                        <button onClick={this.acceptInvitationFromUser()} className='btn btn-success'>
                            {translate("invitation.accept")}
                        </button>&nbsp;
                        <button onClick={this.declineInvitationFromUser(relationship)} className='btn btn-danger'>
                            {translate("invitation.dismiss")}
                        </button>
                    </>
                );
            case RelationshipStatus.pendingRequest:
                return (
                    <button onClick={this.declineInvitationFromUser(relationship)} className='btn btn-danger'>
                        {translate("common.relationship.cancel")}
                    </button>
                );
            default:
                return (
                    <button onClick={this.sendInvitationToUser()} className='btn btn-info'>
                        {translate("common.relationship.send-request")}
                    </button>
                );
        }
    }
    render = () =>
    {
        const {className, breakpoint, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, dispatch, staticContext, authenticatedProfile, history, location, match, contextData,  ...rest} = this.props
        const {profile} = this.props.contextData
        const title = userFullName(profile)
        const cn = classnames("profile-details-module", className)
        const hasRelationship = profile && authenticatedProfile && profile.id != authenticatedProfile.id && profile.relationship
        const profileOptions = this.getProfileOptions()
        return (<Module {...rest} className={cn}>
                    <ModuleHeader loading={false} headerTitle={title}>
                    {profileOptions.length > 0 && <DropDownMenu className="profile-option-dropdown" triggerClass="fas fa-cog fa-2x mx-1" items={profileOptions}></DropDownMenu>}
                    </ModuleHeader>
                    <ModuleContent>
                        <div className="content">
                            {this.renderContent()}
                        </div>
                        {this.renderEditForm()}
                    </ModuleContent>
                    {hasRelationship &&
                        <ModuleFooter>
                            {this.renderFriendshipStatus(profile.relationship[0])}
                            {this.renderFriendshipButtons(profile.relationship[0])}
                        </ModuleFooter>
                    }
            </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {
    return {
        authenticatedProfile:AuthenticationManager.getAuthenticatedUser()
    }
}
export default withContextData(withRouter(connect(mapStateToProps, null)(ProfileDetailsModule)))