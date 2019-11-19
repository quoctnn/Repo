import * as React from "react";
import "./ProfileVolunteeringModule.scss"
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../../components/general/observers/ResponsiveComponent";
import { CommonModuleProps } from "../../Module";
import SimpleModule from "../../SimpleModule";
import { translate } from "../../../localization/AutoIntlProvider";
import { RouteComponentProps, withRouter } from "react-router";
import { ProfileVolunteeringExperience } from '../../../types/intrasocial_types';
import {ApiClient} from '../../../network/ApiClient';
import { stringToDateFormat, DateFormat } from '../../../utilities/Utilities';
import CVListItem from "../CVListItem";
import { withContextData, ContextDataProps } from '../../../hoc/WithContextData';

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps
type State = {
    volunteering:ProfileVolunteeringExperience[]
    isLoading:boolean
    loadedProfileId:number

}
type Props = OwnProps & RouteComponentProps<any> & ContextDataProps
class ProfileVolunteeringModule extends React.PureComponent<Props, State> {

    constructor(props:Props) {
        super(props)
        this.state = {
            volunteering:[],
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
            return {isLoading:true, volunteering:[]}
        }, () => {
            ApiClient.getVolunteering(10, 0, profileId,(data, status, error) => {
                const langs = data && data.results || []
                this.setState((prevState:State) => {
                    return {volunteering:langs, isLoading:false, loadedProfileId:profileId}
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
        const {className, breakpoint, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, staticContext, history, location, match, contextData, ...rest} = this.props
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
export default withContextData(withRouter(ProfileVolunteeringModule))