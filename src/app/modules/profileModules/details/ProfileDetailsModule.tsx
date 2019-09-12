import * as React from "react";
import { connect, DispatchProp } from 'react-redux'
import "./ProfileDetailsModule.scss"
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../../components/general/observers/ResponsiveComponent";
import Module, { CommonModuleProps } from "../../Module";
import { ReduxState } from "../../../redux";
import { ContextManager } from "../../../managers/ContextManager";
import { withRouter, RouteComponentProps } from "react-router";
import { UserProfile, ContextNaturalKey, ProfilePosition, ElasticSearchType } from "../../../types/intrasocial_types";
import { userFullName, stringToDate, DateFormat } from '../../../utilities/Utilities';
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
import { OverflowMenuItem, OverflowMenuItemType, createDropdownItem } from '../../../components/general/OverflowMenu';
import { PopoverBody, Popover } from 'reactstrap';
import moment = require("moment");

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
    profile:UserProfile
    authenticatedProfile:UserProfile
}
type ReduxDispatchProps ={
}
type State = {
    latestJob:ProfilePosition
    isLoading:boolean
    hasLoaded:boolean
    popoverRemoved:boolean
    popoverVisible:boolean
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class ProfileDetailsModule extends React.PureComponent<Props, State> {
    private triggerRef:HTMLElement = null
    constructor(props:Props) {
        super(props)
        this.state = {
            latestJob:null,
            isLoading:false,
            hasLoaded:false,
            popoverRemoved:true,
            popoverVisible:false
        }
    }
    componentDidMount = () => {
        this.fetchData()
    }
    componentDidUpdate = () => {
        this.fetchData()
    }
    fetchData = () => {
        const {hasLoaded, isLoading} = this.state
        if(hasLoaded || isLoading)
            return
        const profileId = this.props.profile && this.props.profile.id
        if(!profileId)
            return
        this.setState((prevState:State) => {
            return {isLoading:true}
        }, () => {
            console.log("fetching positions")
            ApiClient.getPositions(10, 0, profileId,(data, status, error) => {
                const position = (data && data.results || []).filter(p => !p.end_date).sort((a,b) => (a.start_date && stringToDate(a.start_date).valueOf() || 0) - (b.start_date && stringToDate(b.start_date).valueOf() || 0))[0]
                this.setState((prevState:State) => {
                    return {latestJob:position, isLoading:false, hasLoaded:true}
                })
            })
        })
    }
    blockUser = (profile: UserProfile) => (event: React.SyntheticEvent<any>) => {
        ApiClient.userBlock(profile.id, (status) => {
            return status;
        })
    }
    unBlockUser = (profile: UserProfile) => (event: React.SyntheticEvent<any>) => {
        ApiClient.userBlockGetId(profile.id, (data, status, error) => {
            if (!error || status != "error") {
                data.results.map((block) => {
                    ApiClient.userUnBlock(block.id, (status) => {})
                })
                return status;
            }
        })
    }
    sendInvitationToUser = () => (event: React.SyntheticEvent<any>) => {
        ApiClient.friendInvitationSend(this.props.profile.id, () => {})
    }
    acceptInvitationFromUser = () => (event: React.SyntheticEvent<any>) => {
        const profile = this.props.profile
        ApiClient.friendInvitationGetId(profile.id, (data, status, error) => {
            if (!error || status != "error") {
                data.results.map((invite) => {
                    ApiClient.friendInvitationAccept(invite.id, (data, status, error) => {})
                })
                return status;
            }
        })
    }
    declineInvitationFromUser = () => (event: React.SyntheticEvent<any>) => {
        const profile = this.props.profile
        ApiClient.friendInvitationGetId(profile.id, (data, status, error) => {
            if (!error || status != "error") {
                data.results.map((invite) => {
                    ApiClient.friendInvitationDelete(invite.id, false, () => {})
                })
                return status;
            }
        })
    }
    onTriggerClick = (e:React.SyntheticEvent) => {
        e.preventDefault()
        if(!this.state.popoverRemoved)
        {
            this.closePopoverPanel()
        }
        else {
            this.setState( (prevState) => {
                return {popoverRemoved:false, popoverVisible:true}
            })
        }
    }
    closePopoverPanel = () => {
        const completion = () => {
            setTimeout(() => {
                this.setState( (prevState) => {
                    return {popoverVisible:false, popoverRemoved:true}
                })
            }, 300)
        }
        this.setState( (prevState) => {
            return {popoverVisible:false}
        },completion)
    }
    renderTrigger = () => {
        return <div ref={(ref) => this.triggerRef = ref} className="trigger d-flex align-items-center">
                    <i onClick={this.onTriggerClick} className="fas fa-cog"></i>
                </div>
    }
    renderTimezoneInfo = () => {
        if(this.props.profile && this.props.profile.timezone)
            return <TimezoneInfo timezone={this.props.profile.timezone} />
        return null
    }
    renderConnections = () => {
        const {profile, authenticatedProfile} = this.props
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
                             <div className="d-flex flex-column">
                                <div className="">
                                    {translate("Connections")}
                                </div>
                                <div className="">
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

        const {profile, authenticatedProfile} = this.props
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
    renderDropdown = () => {
        const open = !this.state.popoverRemoved || this.state.popoverVisible
        if(!open)
            return null
        let profileDropdownItems: OverflowMenuItem[] = [];
        const profile = this.props.profile
        if (this.props.authenticatedProfile.id !== profile.id) {
            // TODO: Check if user is already blocked and have unblock instead
            if (profile.relationship && profile.relationship.contains("blocked")) {
                profileDropdownItems.push({
                    id: "unblock",
                    type: OverflowMenuItemType.option,
                    title: translate("common.relationship.unblock"),
                    onPress: this.unBlockUser(this.props.profile),
                    toggleMenu: false
                })
            } else {
                profileDropdownItems.push({
                    id: "block",
                    type: OverflowMenuItemType.option,
                    title: translate("common.relationship.block"),
                    onPress: this.blockUser(this.props.profile),
                    toggleMenu: false
                })
            }
        }
        const cn = classnames("dropdown-menu-popover", "profile-detail-dropdown")
        return (
                <Popover className={cn} delay={0} trigger="legacy" placement="bottom"
                         hideArrow={false} isOpen={this.state.popoverVisible}
                         target={this.triggerRef} toggle={this.closePopoverPanel}>
                    <PopoverBody className="pl-0 pr-0">
                        {profileDropdownItems.map(i => createDropdownItem(i, this.closePopoverPanel))}
                    </PopoverBody>
                </Popover>
        )
    }
    renderFriendshipStatus = (relationship:string) => {
        switch(relationship) {
            case("friends"):
                return (
                    <div className='relationship'>
                        {translate("common.relationship.friends")}
                    </div>
                );
            case("pending-request"):
                return (
                    <div className='relationship'>
                        {translate("common.relationship.pending")}
                    </div>
                );
            case("pending-invitation"):
                return (
                    <div className='relationship'>
                        {translate("common.relationship.invited")}
                    </div>
                );
            default: return;
        }
    }
    renderFriendshipButtons = (relationship:string) => {
        switch(relationship) {
            case("friends"):
                return;
            case("blocked"):
                return;
            case("pending-invitation"):
                return (
                    <>
                        <button onClick={this.acceptInvitationFromUser()} className='btn btn-success'>
                            {translate("invitation.accept")}
                        </button>&nbsp;
                        <button onClick={this.declineInvitationFromUser()} className='btn btn-danger'>
                            {translate("invitation.dismiss")}
                        </button>
                    </>
                );
            case("pending-request"):
                return (
                    <button onClick={this.declineInvitationFromUser()} className='btn btn-danger'>
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
        const {className, breakpoint, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, dispatch, staticContext, profile, authenticatedProfile, history, location, match,  ...rest} = this.props
        const title = userFullName(profile)
        const cn = classnames("profile-details-module", className)
        const hasRelationship = profile && authenticatedProfile && profile.id != authenticatedProfile.id && profile.relationship
        return (<Module {...rest} className={cn}>
                    <ModuleHeader loading={false} headerTitle={title}>
                        {this.renderTrigger()}
                        {this.renderDropdown()}
                    </ModuleHeader>
                    <ModuleContent>
                        <div className="content">
                            {this.renderContent()}
                        </div>
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
    const resolved = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.USER)
    return {
        profile:resolved as any as UserProfile,
        authenticatedProfile:AuthenticationManager.getAuthenticatedUser()
    }
}
export default withRouter(connect(mapStateToProps, null)(ProfileDetailsModule))