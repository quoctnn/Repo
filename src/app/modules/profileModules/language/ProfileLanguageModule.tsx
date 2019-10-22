import * as React from "react";
import "./ProfileLanguageModule.scss"
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../../components/general/observers/ResponsiveComponent";
import { CommonModuleProps } from "../../Module";
import SimpleModule from "../../SimpleModule";
import { translate } from "../../../localization/AutoIntlProvider";
import { RouteComponentProps, withRouter } from "react-router";
import { ProfileLanguage } from "../../../types/intrasocial_types";
import {ApiClient} from '../../../network/ApiClient';
import { withContextData, ContextDataProps } from '../../../hoc/WithContextData';

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps
type State = {
    languages:ProfileLanguage[]
    isLoading:boolean
    loadedProfileId:number

}
type Props = OwnProps & RouteComponentProps<any> & ContextDataProps
class ProfileLanguageModule extends React.PureComponent<Props, State> {

    constructor(props:Props) {
        super(props)
        this.state = {
            languages:[],
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
            return {isLoading:true, languages:[]}
        }, () => {
            console.log("fetching languages")
            ApiClient.getLanguages(10, 0, profileId,(data, status, error) => {
                const langs = data && data.results || []
                this.setState((prevState:State) => {
                    return {languages:langs, isLoading:false, loadedProfileId:profileId}
                })
            })
        })
    }
    renderContent = () => {
        return this.state.languages.map((lang, i) => {
            return <div key={lang.id} className="row">
                        <div className="col">{lang.name}</div>
                        <div className="col">{translate("cv.lang.proficiency." + lang.proficiency)}</div>
                    </div>
        })
    }
    shouldModuleRender = () => {
        return this.state.languages && this.state.languages.length > 0
    }
    render = () =>
    {
        const shouldRender = this.shouldModuleRender()
        if(!shouldRender)
            return null
        const {className, breakpoint, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, staticContext, history, location, match, contextData, ...rest} = this.props
        const cn = classnames("profile-language-module", className)
        return <SimpleModule {...rest}
                showHeader={!isModal}
                className={cn}
                breakpoint={breakpoint}
                isLoading={false}
                headerTitle={translate("profile.module.language.title")}>
                <div className="content container">
                        {this.renderContent()}
                </div>
            </SimpleModule>
    }
}
export default withContextData(withRouter(ProfileLanguageModule))