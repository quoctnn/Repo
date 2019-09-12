import * as React from "react";
import { connect, DispatchProp } from 'react-redux'
import "./ProfileVolunteeringModule.scss"
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../../components/general/observers/ResponsiveComponent";
import { CommonModuleProps } from "../../Module";
import { ReduxState } from "../../../redux";
import SimpleModule from "../../SimpleModule";
import { translate } from "../../../localization/AutoIntlProvider";
import { RouteComponentProps, withRouter } from "react-router";
import { ContextNaturalKey, UserProfile, ProfileVolunteeringExperience } from '../../../types/intrasocial_types';
import { ContextManager } from "../../../managers/ContextManager";
import {ApiClient} from '../../../network/ApiClient';
import { stringToDateFormat, DateFormat } from '../../../utilities/Utilities';
import CVListItem from "../CVListItem";

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps & DispatchProp
type ReduxStateProps = {
    profile:UserProfile
}
type ReduxDispatchProps ={
}
type State = {
    volunteering:ProfileVolunteeringExperience[]
    isLoading:boolean
    hasLoaded:boolean

}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class ProfileVolunteeringModule extends React.PureComponent<Props, State> {

    constructor(props:Props) {
        super(props)
        this.state = {
            volunteering:[],
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
            console.log("fetching volunteering")
            ApiClient.getVolunteering(10, 0, profileId,(data, status, error) => {
                const langs = data && data.results || []
                this.setState((prevState:State) => {
                    return {volunteering:langs, isLoading:false, hasLoaded:true}
                })
            })
        })
    }
    getDateString = (startDate:string, endDate:string) => {
        const start = startDate && stringToDateFormat(startDate, DateFormat.year)
        const end = endDate && stringToDateFormat(endDate, DateFormat.year)
        return `${start || "****"} · ${end || translate("Present")}`
    }
    renderContent = () => {
        return this.state.volunteering.map((vol, i) => {
            const avatar = vol.company && vol.company.avatar_original
            const dates = this.getDateString(vol.start_date, vol.end_date)
            const title = <>{vol.role}{" "}{translate("at")}{" "}{vol.company && vol.company.name || vol.company}
            {" "}<span className="medium-small-text">{dates}</span></>
            const description = vol.company && vol.company.description
            return <CVListItem avatar={avatar} key={vol.id} className="exp-item" title={title} description={description} />
        })
    }
    shouldModuleRender = () => {
        return this.state.volunteering && this.state.volunteering.length > 0
    }
    render = () =>
    {
        const shouldRender = this.shouldModuleRender()
        if(!shouldRender)
            return null
        const {className, breakpoint, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, dispatch, staticContext, profile, history, location, match, ...rest} = this.props
        const cn = classnames("profile-volunteering-module", className)
        return <SimpleModule {...rest}
                showHeader={!isModal}
                className={cn}
                breakpoint={breakpoint}
                isLoading={false}
                headerTitle={translate("profile.module.volunteering.title")}>
                <div className="content">
                    {this.renderContent()}
                </div>
            </SimpleModule>
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {
    const resolved = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.USER)
    return {
        profile:resolved as any as UserProfile
    }
}
export default withRouter(connect(mapStateToProps, null)(ProfileVolunteeringModule))