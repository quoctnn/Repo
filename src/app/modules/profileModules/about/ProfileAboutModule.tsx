import * as React from "react";
import { connect, DispatchProp } from 'react-redux'
import "./ProfileAboutModule.scss"
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../../components/general/observers/ResponsiveComponent";
import { CommonModuleProps } from "../../Module";
import { ReduxState } from "../../../redux";
import SimpleModule from "../../SimpleModule";
import { translate } from "../../../localization/AutoIntlProvider";
import { UserProfile, ContextNaturalKey } from '../../../types/intrasocial_types';
import { ContextManager } from "../../../managers/ContextManager";
import { RouteComponentProps, withRouter } from "react-router";

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps & DispatchProp
type ReduxStateProps = {
    profile:UserProfile
}
type ReduxDispatchProps ={
}
type State = {
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
class ProfileAboutModule extends React.PureComponent<Props, State> {

    constructor(props:Props) {
        super(props)
        this.state = {
        }
    }
    renderContent = () => {
        return this.props.profile && this.props.profile.biography
    }
    shouldModuleRender = () => {
        return this.props.profile && this.props.profile.biography
    }
    render = () =>
    {
        const shouldRender = this.shouldModuleRender()
        if(!shouldRender)
            return null
        const {className, breakpoint, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, dispatch, staticContext, profile, history, location, match, ...rest} = this.props
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
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {
    const resolved = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.USER)
    return {
        profile:resolved as any as UserProfile
    }
}
//@ts-ignore
export default withRouter(connect(mapStateToProps, null)(ProfileAboutModule))