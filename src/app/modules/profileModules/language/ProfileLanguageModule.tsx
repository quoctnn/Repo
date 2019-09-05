import * as React from "react";
import { connect, DispatchProp } from 'react-redux'
import "./ProfileLanguageModule.scss"
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../../components/general/observers/ResponsiveComponent";
import { CommonModuleProps } from "../../Module";
import { ReduxState } from "../../../redux";
import SimpleModule from "../../SimpleModule";
import { translate } from "../../../localization/AutoIntlProvider";
import { RouteComponentProps, withRouter } from "react-router";
import { ContextNaturalKey, UserProfile, ProfileLanguage } from "../../../types/intrasocial_types";
import { ContextManager } from "../../../managers/ContextManager";
import {ApiClient} from '../../../network/ApiClient';

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps & DispatchProp
type ReduxStateProps = {
    profile:UserProfile
}
type ReduxDispatchProps ={
}
type State = {
    languages:ProfileLanguage[]
    isLoading:boolean
    hasLoaded:boolean

}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class ProfileLanguageModule extends React.PureComponent<Props, State> {

    constructor(props:Props) {
        super(props)
        this.state = {
            languages:[],
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
            console.log("fetching languages")
            ApiClient.getLanguages(10, 0, profileId,(data, status, error) => {
                const langs = data && data.results || []
                this.setState((prevState:State) => {
                    return {languages:langs, isLoading:false, hasLoaded:true}
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
        const {className, breakpoint, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, dispatch, staticContext, profile, history, location, match, ...rest} = this.props
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
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {
    const resolved = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.USER)
    return {
        profile:resolved as any as UserProfile
    }
}
//@ts-ignore
export default withRouter(connect(mapStateToProps, null)(ProfileLanguageModule))