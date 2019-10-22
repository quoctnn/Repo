import * as React from "react";
import { connect, DispatchProp } from 'react-redux'
import "./ProfileAboutModule.scss"
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../../components/general/observers/ResponsiveComponent";
import { CommonModuleProps } from "../../Module";
import SimpleModule from "../../SimpleModule";
import { translate } from "../../../localization/AutoIntlProvider";
import { RouteComponentProps, withRouter } from "react-router";
import { withContextData, ContextDataProps } from "../../../hoc/WithContextData";

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps & DispatchProp
type State = {
}
type Props = OwnProps & RouteComponentProps<any> & ContextDataProps
class ProfileAboutModule extends React.PureComponent<Props, State> {

    constructor(props:Props) {
        super(props)
        this.state = {
        }
    }
    renderContent = () => {
        return this.props.contextData.profile && this.props.contextData.profile.biography
    }
    shouldModuleRender = () => {
        return this.props.contextData.profile && this.props.contextData.profile.biography
    }
    render = () =>
    {
        const shouldRender = this.shouldModuleRender()
        if(!shouldRender)
            return null
        const {className, breakpoint, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, dispatch, staticContext, history, location, match, ...rest} = this.props
        const cn = classnames("profile-about-module", className)
        return <SimpleModule {...rest}
                showHeader={!isModal}
                className={cn}
                breakpoint={breakpoint}
                isLoading={false}
                headerTitle={translate("profile.module.about.title")}>
                    <div className="content">{this.renderContent()}</div>
            </SimpleModule>
    }
}
export default withContextData(withRouter(ProfileAboutModule))