import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import ModuleMenuTrigger from '../ModuleMenuTrigger';
import "./ProjectDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { Project, Community, ContextNaturalKey } from '../../types/intrasocial_types';
import { IntraSocialUtilities } from '../../utilities/IntraSocialUtilities';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import { CommunityManager } from '../../managers/CommunityManager';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getContextObject, resolveContextObject } from '../newsfeed/NewsfeedModule';
import StackedAvatars from '../../components/general/StackedAvatars';
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey: ContextNaturalKey
}
type State = {
    menuVisible:boolean
    isLoading:boolean
}
type ReduxStateProps = {
    community: Community
    project: Project
    projectId: number
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class ProjectDetailsModule extends React.Component<Props, State> {
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
    menuItemClick = (e) => {
        console.log("menuItemClick")
        e.preventDefault()
        e.stopPropagation()
        const visible = !this.state.menuVisible
        const newState:any = {menuVisible:visible}
        if(!visible)
        {
            /* TODO: Close the modal dialog with the project settings */
        } else {
            /* TODO: Show a modal dialog with the project settings */
        }
        this.setState(newState)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    renderDetails = (project:Project, community:Community) =>  {
        return (
            <div className="details-module details-content">
                <div className="text-truncate">
                    <span className="details-field-name">{translate("common.community")}: </span>
                    <span className="details-field-value"><Link to={community.uri}>{community.name}</Link></span>
                </div>
                <div className="details-description">
                    <span className="details-field-value">{IntraSocialUtilities.truncateText(IntraSocialUtilities.htmlToText(project.description), 200)}</span>
                </div>
            </div>
        )
    }
    renderMembers = (project:Project) =>  {
        return (
            <div className="details-module details-members">
                <div>
                    {project.members_count}&nbsp;
                    {(project.members_count > 1) ? translate("common.members") : translate("common.member")}&nbsp;-&nbsp;
                    <Link to="#">{translate("common.see.all")}</Link>
                     {/* TODO: Members page */}
                </div>
                <div>
                    <StackedAvatars userIds={project.members} />
                </div>
            </div>
        )
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, project, projectId, community, contextNaturalKey, ...rest} = this.props
        return (<Module {...rest}>
                    <ModuleHeader title={project && project.name || translate("detail.module.title")} loading={this.state.isLoading}>
                        <ModuleMenuTrigger onClick={this.menuItemClick} />
                    </ModuleHeader>
                    {breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <>
                            <ModuleContent>
                                {!project && <LoadingSpinner key="loading"/>}
                                {project && community && this.renderDetails(project, community)}
                            </ModuleContent>
                        </>
                    }
                    <ModuleFooter>
                        {project && this.renderMembers(project)}
                    </ModuleFooter>
                </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {

    const resolveContext = state.resolvedContext
    const resolvedContext = resolveContextObject(resolveContext, ownProps.contextNaturalKey)
    const projectId = resolvedContext && resolvedContext.contextObjectId
    const project = resolvedContext && getContextObject(resolvedContext.contextNaturalKey, resolvedContext.contextObjectId) as Project
    const community = resolveContext && !!resolveContext.communityId ? CommunityManager.getCommunity(resolveContext.communityId.toString()) : undefined
    return {
        community,
        project,
        projectId
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ProjectDetailsModule))