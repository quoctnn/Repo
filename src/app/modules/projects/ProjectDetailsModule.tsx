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
import { Project, Community, ContextNaturalKey, Permission } from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import { CommunityManager } from '../../managers/CommunityManager';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DetailsMembers } from '../../components/details/DetailsMembers';
import { DetailsContent } from '../../components/details/DetailsContent';
import { ContextManager } from '../../managers/ContextManager';
import classNames from 'classnames';
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
    render()
    {
        const {breakpoint, history, match, location, staticContext, project, community, contextNaturalKey, ...rest} = this.props
        return (<Module {...rest}>
                    <ModuleHeader headerTitle={project && project.name || translate("detail.module.title")} loading={this.state.isLoading}>
                        <ModuleMenuTrigger onClick={this.menuItemClick} />
                    </ModuleHeader>
                    {breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <ModuleContent>
                            { project && project.permission >= Permission.read &&
                                <div className="project-details-content">
                                    <DetailsContent community={community} description={project.description}/>
                                </div>
                                ||
                                <LoadingSpinner key="loading"/>
                            }
                        </ModuleContent>
                    }
                    <ModuleFooter>
                    { project && project.permission >= Permission.read &&
                            <DetailsMembers members={project.members} />
                        }
                    </ModuleFooter>
                </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const project = ContextManager.getContextObject(ownProps.location.pathname, ownProps.contextNaturalKey) as Project
    const community = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.COMMUNITY) as Community
    return {
        community,
        project,
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ProjectDetailsModule))