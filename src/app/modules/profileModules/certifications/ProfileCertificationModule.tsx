import * as React from "react";
import { DispatchProp } from 'react-redux'
import "./ProfileCertificationModule.scss"
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../../components/general/observers/ResponsiveComponent";
import { CommonModuleProps } from "../../Module";
import SimpleModule from "../../SimpleModule";
import { translate } from "../../../localization/AutoIntlProvider";
import { RouteComponentProps, withRouter } from "react-router";
import {  ProfileCertification } from "../../../types/intrasocial_types";
import {ApiClient} from '../../../network/ApiClient';
import { stringToDateFormat, DateFormat, stringToDate } from '../../../utilities/Utilities';
import * as moment from 'moment-timezone';
import CVListItem from '../CVListItem';
import { withContextData, ContextDataProps } from "../../../hoc/WithContextData";

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps & DispatchProp
type State = {
    certifications:ProfileCertification[]
    isLoading:boolean
    loadedProfileId:number

}
type Props = OwnProps & RouteComponentProps<any> & ContextDataProps
class ProfileCertificationModule extends React.PureComponent<Props, State> {

    constructor(props:Props) {
        super(props)
        this.state = {
            certifications:[],
            isLoading:false,
            loadedProfileId:null,
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
            return {isLoading:true, certifications:[]}
        }, () => {
            console.log("fetching certifications")
            ApiClient.getCertifications(10, 0, profileId,(data, status, error) => {
                const langs = data && data.results || []
                this.setState((prevState:State) => {
                    return {certifications:langs, isLoading:false, loadedProfileId:profileId}
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
        const {className, breakpoint, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, dispatch, staticContext, history, location, match, ...rest} = this.props
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
export default withContextData(withRouter(ProfileCertificationModule))