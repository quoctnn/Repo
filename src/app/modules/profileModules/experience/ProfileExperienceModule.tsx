import * as React from "react";
import "./ProfileExperienceModule.scss"
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../../components/general/observers/ResponsiveComponent";
import { CommonModuleProps } from "../../Module";
import SimpleModule from "../../SimpleModule";
import { translate } from "../../../localization/AutoIntlProvider";
import { RouteComponentProps, withRouter } from "react-router";
import { ProfilePosition } from "../../../types/intrasocial_types";
import {ApiClient} from '../../../network/ApiClient';
import { stringToDateFormat, DateFormat } from '../../../utilities/Utilities';
import CVListItem from "../CVListItem";
import { withContextData, ContextDataProps } from '../../../hoc/WithContextData';

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps
type State = {
    positions:ProfilePosition[]
    isLoading:boolean
    loadedProfileId:number

}
type Props = OwnProps & RouteComponentProps<any> & ContextDataProps
class ProfileExperienceModule extends React.PureComponent<Props, State> {

    constructor(props:Props) {
        super(props)
        this.state = {
            positions:[],
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
            return {isLoading:true, positions:[]}
        }, () => {
            ApiClient.getPositions(10, 0, profileId,(data, status, error) => {
                const langs = data && data.results || []
                this.setState((prevState:State) => {
                    return {positions:langs, isLoading:false, loadedProfileId:profileId}
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
        const {className, breakpoint, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, staticContext, history, location, match, contextData, ...rest} = this.props
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
export default withContextData(withRouter(ProfileExperienceModule))