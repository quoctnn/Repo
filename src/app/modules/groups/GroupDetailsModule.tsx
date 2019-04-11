import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import "./GroupDetailsModule.scss"
import ModuleMenu from '../ModuleMenu';
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import { Group, Community } from '../../types/intrasocial_types';
import { IntraSocialUtilities } from '../../utilities/IntraSocialUtilities';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import { CommunityManager } from '../../managers/CommunityManager';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ContextNaturalKey } from '../../../../old_source/types/intrasocial_types2';
import { getContextObject, resolveContextObject } from '../newsfeed/NewsfeedModule';
import ModuleFooter from '../ModuleFooter';
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey: ContextNaturalKey
}
type State = {
    menuVisible:boolean
    isLoading:Boolean
}
type ReduxStateProps = {
    community: Community
    group: Group
    groupId: number
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class GroupDetailsModule extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            menuVisible:false
        }
    }
    componentDidUpdate = (prevProps:Props) => {
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    renderLoading = () => {
        if (this.state.isLoading) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>)
        }
    }
    renderDetails = (group:Group, community:Community) =>  {
        return (
            <div className="details-module details-content">
                <div className="text-truncate">
                    <span className="details-field-name">{translate("common.community")}: </span>
                    <span className="details-field-value"><Link to={community.uri}>{community.name}</Link></span>
                </div>
                <div>
                    <span className="details-field-name">{translate("common.description")}: </span>
                    <span className="details-field-value">{IntraSocialUtilities.truncateText(IntraSocialUtilities.htmlToText(group.description), 150)}</span>
                </div>
            </div>
        )
    }
    renderMembers = (group:Group) =>  {
        return (
            <div className="details-module details-members">
                <div>
                    {group.members_count + " "}
                    {(group.members_count > 1) ? translate("common.members") : translate("common.member") + " "}
                     - <Link to="#">{translate("common.see.all")}</Link>
                     {/* TODO: Members page */}
                </div>
                <div>
                    {/* TODO: 5x Profile avatars*/}
                    {group.members}
                </div>
            </div>
        )
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, group, groupId, community, contextNaturalKey, ...rest} = this.props
        return (<Module {...rest}>
                    <ModuleHeader>
                        <div className="flex-grow-1 text-truncate d-flex align-items-center">
                            <div className="text-truncate module-header-title-left">{group && group.name || translate("detail.module.title")}</div>
                            {this.renderLoading()}
                            <div className="spacer flex-grow-1 flex-shrink-1"></div>
                        </div>
                    </ModuleHeader>
                    {breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <>
                            <ModuleContent>
                                {!group && <LoadingSpinner key="loading"/>}
                                {group && community && this.renderDetails(group, community)}
                            </ModuleContent>
                        </>
                    }
                    <ModuleFooter>
                        {group && this.renderMembers(group)}
                    </ModuleFooter>
                </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {

    const resolveContext = state.resolvedContext
    const resolvedContext = resolveContextObject(resolveContext, ownProps.contextNaturalKey)
    const groupId = resolvedContext && resolvedContext.contextObjectId
    const group = resolvedContext && getContextObject(resolvedContext.contextNaturalKey, resolvedContext.contextObjectId) as Group
    const community = resolveContext && !!resolveContext.communityId ? CommunityManager.getCommunity(resolveContext.communityId.toString()) : undefined
    return {
        community,
        group,
        groupId
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(GroupDetailsModule))