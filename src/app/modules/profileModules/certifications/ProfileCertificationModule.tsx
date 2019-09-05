import * as React from "react";
import { connect, DispatchProp } from 'react-redux'
import "./ProfileCertificationModule.scss"
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../../components/general/observers/ResponsiveComponent";
import { CommonModuleProps } from "../../Module";
import { ReduxState } from "../../../redux";
import SimpleModule from "../../SimpleModule";
import { translate } from "../../../localization/AutoIntlProvider";
import { RouteComponentProps, withRouter } from "react-router";
import { ContextNaturalKey, UserProfile, ProfileCertification } from "../../../types/intrasocial_types";
import { ContextManager } from "../../../managers/ContextManager";
import {ApiClient} from '../../../network/ApiClient';
import { stringToDateFormat, DateFormat, stringToDate } from '../../../utilities/Utilities';
import * as moment from 'moment-timezone';
import CVListItem from '../CVListItem';

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps & DispatchProp
type ReduxStateProps = {
    profile:UserProfile
}
type ReduxDispatchProps ={
}
type State = {
    certifications:ProfileCertification[]
    isLoading:boolean
    hasLoaded:boolean

}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class ProfileCertificationModule extends React.PureComponent<Props, State> {

    constructor(props:Props) {
        super(props)
        this.state = {
            certifications:[],
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
            console.log("fetching certifications")
            ApiClient.getCertifications(10, 0, profileId,(data, status, error) => {
                const langs = data && data.results || []
                this.setState((prevState:State) => {
                    return {certifications:langs, isLoading:false, hasLoaded:true}
                })
            })
        })
    }
    getCertStart = (startDate:string) => {
        if(!startDate)
            return null
        return `${translate("Issued")} ${stringToDateFormat(startDate, DateFormat.monthYear)}`
    }
    getCertEnd = (endDate:string) => {
        if(!endDate)
            return translate("No Expiration Date")
        const date = stringToDate(endDate)
        const isExpired = moment().isAfter(date)
        return `${translate(isExpired ? "Expired" : "Expires")} ${stringToDateFormat(endDate, DateFormat.monthYear)}`
    }
    renderContent = () => {
        return this.state.certifications.map((cert, i) => {
            const certStart = this.getCertStart(cert.start_date)
            const avatar = cert.company && cert.company.avatar_original
            const title = <>{cert.name}{" "}{translate("at")}{" "}{cert.company && cert.company.name || cert.company}</>
            const description = certStart ? <>{certStart}{" · "}{this.getCertEnd(cert.end_date)}</> : undefined
            return <CVListItem avatar={avatar} key={cert.id} className="cert-item" title={title} description={description} />
        })
    }
    shouldModuleRender = () => {
        return this.state.certifications && this.state.certifications.length > 0
    }
    render = () =>
    {
        const shouldRender = this.shouldModuleRender()
        if(!shouldRender)
            return null
        const {className, breakpoint, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, dispatch, staticContext, profile, history, location, match, ...rest} = this.props
        const cn = classnames("profile-certification-module", className)
        return <SimpleModule {...rest}
                showHeader={!isModal}
                className={cn}
                breakpoint={breakpoint}
                isLoading={false}
                headerTitle={translate("profile.module.certification.title")}>
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
export default withRouter(connect(mapStateToProps, null)(ProfileCertificationModule))