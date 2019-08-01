import * as React from "react";
import { connect, DispatchProp } from 'react-redux'
import "./ProfileDetailsModule.scss"
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../../components/general/observers/ResponsiveComponent";
import { CommonModuleProps } from "../../Module";
import { ReduxState } from "../../../redux";
import SimpleModule from "../../SimpleModule";
import { translate } from "../../../localization/AutoIntlProvider";

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps & DispatchProp
type ReduxStateProps = {
}
type ReduxDispatchProps ={
}
type State = {
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class ProfileDetailsModule extends React.PureComponent<Props, State> {

    constructor(props:Props) {
        super(props)
        this.state = {
        }
    }
    renderContent = () => {
        return <div>Content</div>
    }
    render = () => 
    {
        const {className, breakpoint, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, dispatch, ...rest} = this.props
        const cn = classnames("profile-details-module", className)
        return <SimpleModule {...rest} 
                showHeader={!isModal}
                className={cn} 
                breakpoint={breakpoint} 
                isLoading={false} 
                headerTitle={translate("profile.module.details.title")}>
                {this.renderContent()}
            </SimpleModule>
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
    return {
    }
}
export default connect(mapStateToProps, null)(ProfileDetailsModule)