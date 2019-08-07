import * as React from "react";
import { connect, DispatchProp } from 'react-redux'
import "./ProfileDetailsModule.scss"
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../../components/general/observers/ResponsiveComponent";
import Module, { CommonModuleProps } from "../../Module";
import { ReduxState } from "../../../redux";
import { ContextManager } from "../../../managers/ContextManager";
import { withRouter, RouteComponentProps } from "react-router";
import { UserProfile, ContextNaturalKey, ProfilePosition } from "../../../types/intrasocial_types";
import { userFullName, stringToDate, DateFormat } from '../../../utilities/Utilities';
import ModuleContent from "../../ModuleContent";
import ModuleHeader from "../../ModuleHeader";
import ApiClient from "../../../network/ApiClient";
import { translate } from "../../../localization/AutoIntlProvider";
import { AuthenticationManager } from '../../../managers/AuthenticationManager';
import StackedAvatars from "../../../components/general/StackedAvatars";
import { Link } from "react-router-dom";
import { Moment } from "moment-timezone";
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
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class ProfileDetailsModule extends React.PureComponent<Props, State> {

    constructor(props:Props) {
        super(props)
        this.state = {
            latestJob:null,
            isLoading:false,
            hasLoaded:false,
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
                                <Link to="#">{translate("common.see.all")}</Link>
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
    render = () => 
    {
        const {className, breakpoint, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, dispatch, staticContext, profile, authenticatedProfile, history, location, match,  ...rest} = this.props
        const title = userFullName(profile)
        const cn = classnames("profile-details-module", className)
        return (<Module {...rest} className={cn}>
                    <ModuleHeader loading={false} headerTitle={title}>
                        <i className="fas fa-cog"></i>
                    </ModuleHeader>
                    <ModuleContent>
                        <div className="content">
                            {this.renderContent()}
                        </div>
                    </ModuleContent>
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