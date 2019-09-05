import * as React from "react";
import { connect, DispatchProp } from 'react-redux'
import "./ProfileExperienceModule.scss"
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../../components/general/observers/ResponsiveComponent";
import { CommonModuleProps } from "../../Module";
import { ReduxState } from "../../../redux";
import SimpleModule from "../../SimpleModule";
import { translate } from "../../../localization/AutoIntlProvider";
import { RouteComponentProps, withRouter } from "react-router";
import { ContextNaturalKey, UserProfile, ProfilePosition } from "../../../types/intrasocial_types";
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
    positions:ProfilePosition[]
    isLoading:boolean
    hasLoaded:boolean

}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class ProfileExperienceModule extends React.PureComponent<Props, State> {

    constructor(props:Props) {
        super(props)
        this.state = {
            positions:[],
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
                const langs = data && data.results || []
                this.setState((prevState:State) => {
                    return {positions:langs, isLoading:false, hasLoaded:true}
                })
            })
        })
    }
    getDateString = (startDate:string, endDate:string) => {
        const start = startDate && stringToDateFormat(startDate, DateFormat.monthYear)
        const end = endDate && stringToDateFormat(endDate, DateFormat.monthYear)
        return `${start || "****"} · ${end || translate("Present")}`
    }
    renderContent = () => {
        return this.state.positions.map((position, i) => {
            const avatar = position.company && position.company.avatar_original
            const dates = this.getDateString(position.start_date, position.end_date)
            const title = <>{position.name}{" "}{translate("at")}{" "}{position.company && position.company.name || position.company}
            {" "}<span className="medium-small-text">{dates}</span></>
            const description = position.description
            return <CVListItem avatar={avatar} key={position.id} className="exp-item" title={title} description={description} />
        })
    }
    shouldModuleRender = () => {
        return this.state.positions && this.state.positions.length > 0
    }
    render = () =>
    {
        const shouldRender = this.shouldModuleRender()
        if(!shouldRender)
            return null
        const {className, breakpoint, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, dispatch, staticContext, profile, history, location, match, ...rest} = this.props
        const cn = classnames("profile-experience-module", className)
        return <SimpleModule {...rest}
                showHeader={!isModal}
                className={cn}
                breakpoint={breakpoint}
                isLoading={false}
                headerTitle={translate("profile.module.experience.title")}>
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
//@ts-ignore
export default withRouter(connect(mapStateToProps, null)(ProfileExperienceModule))