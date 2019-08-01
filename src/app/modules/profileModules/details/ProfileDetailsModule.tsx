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
import { userFullName, stringToDate } from '../../../utilities/Utilities';
import ModuleContent from "../../ModuleContent";
import ModuleHeader from "../../ModuleHeader";
import ApiClient from "../../../network/ApiClient";
import { translate } from "../../../localization/AutoIntlProvider";

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps & DispatchProp
type ReduxStateProps = {
    profile:UserProfile
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
    renderContent = () => {
        const position = this.state.latestJob
        return <>
                {position && <div className="latest-position">{position.name}{" "}{translate("at")}{" "}{position.company && position.company.name || position.company}</div>}
                </>
    }
    render = () => 
    {
        const {className, breakpoint, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, dispatch, staticContext, profile, history, location, match,  ...rest} = this.props
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
        profile:resolved as any as UserProfile
    }
}
export default withRouter(connect(mapStateToProps, null)(ProfileDetailsModule))