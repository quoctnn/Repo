import * as React from "react";
import "./ProfileEducationModule.scss"
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../../components/general/observers/ResponsiveComponent";
import { CommonModuleProps } from "../../Module";
import SimpleModule from "../../SimpleModule";
import { translate } from "../../../localization/AutoIntlProvider";
import { RouteComponentProps, withRouter } from "react-router";
import {  UserProfile, ProfileEducation } from "../../../types/intrasocial_types";
import {ApiClient} from '../../../network/ApiClient';
import { stringToDateFormat, DateFormat } from '../../../utilities/Utilities';
import CVListItem from "../CVListItem";
import { withContextData, ContextDataProps } from '../../../hoc/WithContextData';

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps
type State = {
    educations:ProfileEducation[]
    isLoading:boolean
    loadedProfileId:number

}
type Props = OwnProps & RouteComponentProps<any> & ContextDataProps
class ProfileEducationModule extends React.PureComponent<Props, State> {

    constructor(props:Props) {
        super(props)
        this.state = {
            educations:[],
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
            return {isLoading:true, educations:[]}
        }, () => {
            ApiClient.getEducations(10, 0, profileId,(data, status, error) => {
                const langs = data && data.results || []
                this.setState((prevState:State) => {
                    return {educations:langs, isLoading:false, loadedProfileId:profileId}
                })
            })
        })
    }
    getDateString = (startDate:string, endDate:string) => {
        const start = startDate && stringToDateFormat(startDate, DateFormat.year)
        const end = endDate && stringToDateFormat(endDate, DateFormat.year)
        return `${start || "****"} · ${end || "****"}`
    }
    renderContent = () => {
        return this.state.educations.map((education, i) => {
            const avatar = education.school && education.school.avatar_original
            const dates = this.getDateString(education.start_date, education.end_date)
            const fos = !!education.fields_of_study ? ", " + education.fields_of_study : undefined
            const title = <>{education.name}{fos}{" "}{translate("at")}{" "}{education.school && education.school.name || education.school}
            {" "}<span className="medium-small-text">{dates}</span></>
            const description = education.notes
            return <CVListItem avatar={avatar} key={education.id} className="edu-item" title={title} description={description} />
        })
    }
    shouldModuleRender = () => {
        return this.state.educations && this.state.educations.length > 0
    }
    render = () =>
    {
        const shouldRender = this.shouldModuleRender()
        if(!shouldRender)
            return null
        const {className, breakpoint, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, staticContext, history, location, match, contextData, ...rest} = this.props
        const cn = classnames("profile-education-module", className)
        return <SimpleModule {...rest}
                showHeader={!isModal}
                className={cn}
                breakpoint={breakpoint}
                isLoading={false}
                headerTitle={translate("profile.module.education.title")}>
                <div className="content">
                    {this.renderContent()}
                </div>
            </SimpleModule>
    }
}
export default withContextData(withRouter(ProfileEducationModule))