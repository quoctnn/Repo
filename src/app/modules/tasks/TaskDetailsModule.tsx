import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import ModuleMenuTrigger from '../ModuleMenuTrigger';
import "./TaskDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { Task, Project, Community, ContextNaturalKey, Permission } from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DetailsContent } from '../../components/details/DetailsContent';
import { ContextManager } from '../../managers/ContextManager';
import { DetailsMembers } from '../../components/details/DetailsMembers';
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
    task: Task
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class TaskDetailsModule extends React.Component<Props, State> {
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
        e.preventDefault()
        e.stopPropagation()
        const visible = !this.state.menuVisible
        const newState:any = {menuVisible:visible}
        if(!visible)
        {
            /* TODO: Close the modal dialog with the task settings */
        } else {
            /* TODO: Show a modal dialog with the task settings */
        }
        this.setState(newState)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, task, project, community, contextNaturalKey, ...rest} = this.props
        return (<Module {...rest}>
                        <ModuleHeader className="task-detail" headerTitle={task && task.title || translate("detail.module.title")} loading={this.state.isLoading}>
                            <ModuleMenuTrigger onClick={this.menuItemClick} />
                        </ModuleHeader>
                        {breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                            <>
                                <ModuleContent>
                                { task && task.permission >= Permission.read &&
                                    <div className="task-details-content">
                                        <DetailsContent community={community} description={task.description}>
                                                { this.props.project &&
                                                    <div>
                                                        <div className="details-field-name">{translate("common.project")}</div>
                                                        <div title={this.props.project.name} className="details-field-value text-truncate"><Link to={this.props.project.uri}>{this.props.project.name}</Link></div>
                                                    </div>
                                                }
                                        </DetailsContent>
                                    </div>
                                        ||
                                    <LoadingSpinner key="loading"/>
                                }
                                </ModuleContent>
                                <ModuleFooter>
                                    <div className="details-module d-flex flex-row">
                                        { task.responsible &&
                                            <div className="details-members-left" style={{flexGrow: 1}}>
                                                <div>
                                                    {translate('task.responsible')}
                                                    <StackedAvatars userIds={[task.responsible.id]} />
                                                </div>
                                            </div>
                                        }
                                        { task.assigned_to && task.assigned_to.length > 0 &&
                                            <div className="details-members">
                                                <div>
                                                    {translate('task.assigned_to')}
                                                    <StackedAvatars userIds={task.assigned_to.map((user) => {return user.id})} />
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </ModuleFooter>
                            </>
                        }
                </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const task = ContextManager.getContextObject(ownProps.location.pathname, ownProps.contextNaturalKey) as Task
    const project = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.PROJECT) as Project
    const community = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.COMMUNITY) as Community
    return {
        community,
        project,
        task,
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(TaskDetailsModule))