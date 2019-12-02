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
import { ContextNaturalKey, Permission, TaskState, TaskPriority, TimeSpent, Task } from '../../types/intrasocial_types';
import { DetailsContent } from '../../components/details/DetailsContent';
import { withContextData, ContextDataProps } from '../../hoc/WithContextData';
import { ProfileManager } from '../../managers/ProfileManager';
import { Badge } from 'reactstrap';
import { TimeComponent } from '../../components/general/TimeComponent';
import UserProfileAvatar from '../../components/general/UserProfileAvatar';
import { uniqueId } from '../../utilities/Utilities';
import { TaskController } from '../../managers/TaskController';
import { OverflowMenuItem, OverflowMenuItemType } from '../../components/general/OverflowMenu';
import { DropDownMenu } from '../../components/general/DropDownMenu';
import TaskCreateComponent from '../../components/general/contextCreation/TaskCreateComponent';
type OwnProps = {
    breakpoint: ResponsiveBreakpoint
    contextNaturalKey: ContextNaturalKey
}
type State = {
    menuVisible: boolean
    isLoading: boolean
    editFormVisible:boolean
    editFormReloadKey:string
}
type Props = OwnProps & RouteComponentProps<any> & ContextDataProps
class TaskDetailsModule extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: false,
            menuVisible: false,
            editFormVisible:false,
            editFormReloadKey:uniqueId(),
        }
    }
    componentDidUpdate = (prevProps: Props) => {
        if (prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading) {
            this.setState({ isLoading: false })
        }
    }
    menuItemClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const visible = !this.state.menuVisible
        const newState: any = { menuVisible: visible }
        if (!visible) {
            /* TODO: Close the modal dialog with the task settings */
        } else {
            /* TODO: Show a modal dialog with the task settings */
        }
        this.setState(newState)
    }
    feedLoadingStateChanged = (isLoading: boolean) => {
        this.setState({ isLoading })
    }

    showTaskCreateForm = () => {
        this.setState((prevState:State) => {
            return {editFormVisible:true, editFormReloadKey:uniqueId()}
        })
    }
    hideTaskCreateForm = () => {

        this.setState((prevState:State) => {
            return {editFormVisible:false}
        })
    }
    handleTaskCreateForm = (task:Task) => {
        if(!!task)
        {
            TaskController.partialUpdate(task)
        }
        this.hideTaskCreateForm()
    }

    getTaskOptions = (task:Task) => {
        const options: OverflowMenuItem[] = []
        const {authenticatedUser} = this.props.contextData
        if(task.permission >= Permission.moderate)
        {
            options.push({id:"edit", type:OverflowMenuItemType.option, title:translate("Edit"), onPress:this.showTaskCreateForm, iconClass:"fas fa-pen", iconStackClass:Permission.getShield(task.permission)})
        }
        return options
    }

    renderEditForm = (task:Task) => {
        const visible = this.state.editFormVisible
        return <TaskCreateComponent onCancel={this.hideTaskCreateForm} key={this.state.editFormReloadKey} task={task} project={this.props.contextData.project} visible={visible} onComplete={this.handleTaskCreateForm} />
    }

    renderOptions = (task:Task) => {

        const taskOptions = this.getTaskOptions(task)
        if(taskOptions.length > 0)
            return <DropDownMenu className="project-option-dropdown" triggerClass="fas fa-cog fa-2x mx-1" items={taskOptions}></DropDownMenu>
        return null
    }

    render() {
        const { breakpoint, history, match, location, staticContext, contextNaturalKey, contextData, ...rest } = this.props
        const { task, project, community } = this.props.contextData
        const creator = task.creator && ProfileManager.getProfileById(task.creator)
        const last_change_by = task.latest_change_by && ProfileManager.getProfileById(task.latest_change_by)
        const responsible = task.responsible && ProfileManager.getProfileById(task.responsible)
        const assigned = task.assigned_to && task.assigned_to.length > 0 && ProfileManager.getProfiles(task.assigned_to)
        const estimatedTime: TimeSpent = { hours: task.estimated_hours || 0, minutes: task.estimated_minutes || 0 }
        return (<Module {...rest}>
            <ModuleHeader className="task-detail" headerTitle={task && task.title || translate("detail.module.title")} loading={this.state.isLoading}>
                {this.renderOptions(task)}
            </ModuleHeader>
            {true && //breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                <>
                    <ModuleContent>
                        {task && task.permission >= Permission.read &&
                            <div className="task-details-content">
                                <DetailsContent community={community} description={task.description}>
                                    {project &&
                                        <div>
                                            <div className="details-field-name">{translate("common.project.project")}</div>
                                            <div title={project.name} className="details-field-value text-truncate"><Link to={project.uri}>{project.name}</Link></div>
                                        </div>
                                    }
                                    {task.category &&
                                        <div>
                                            <div className="details-field-name">{translate("task.category.title")}</div>
                                            <div title={task.category} className="details-field-value text-truncate">{task.category}</div>
                                        </div>
                                    }
                                </DetailsContent>
                                {this.renderEditForm(task)}
                            </div>
                        }
                    </ModuleContent>
                    <div className="task-info">
                        <div className="status-info d-flex justify-content-between">
                            {task.state && <div>{translate("task.module.menu.state.title")}:<Badge className="ml-1" color={TaskState.colorForState(task.state)}>{translate("task.state." + task.state)}</Badge></div>}
                            {task.priority && <div>{translate("task.module.menu.priority.title")}:<Badge className="ml-1" color={TaskPriority.colorForPriority(task.priority)}>{translate("task.priority." + task.priority)}</Badge></div>}
                            {task.due_date && <div>{translate("task.due_date.title")}:<TimeComponent date={task.due_date} /></div>}
                        </div>
                        <div className="time-use d-flex justify-content-between">
                            {estimatedTime &&
                                <div className="task-estimated-time">
                                    {translate("task.module.menu.estimated-time.title") + ": " + TimeSpent.toString(estimatedTime)}
                                </div>
                            }
                            {task.spent_time &&
                                <div className="task-spent-time">
                                    {translate("task.module.menu.spent-time.title") + ": " + TimeSpent.toString(task.spent_time)}
                                </div>
                            }
                        </div>
                        <div className="update-info d-flex justify-content-between">
                            {creator &&
                                <div className="d-flex">
                                    {translate("task.module.menu.creator.title")}:&nbsp;
                                    <div className="d-flex task-user">
                                        <UserProfileAvatar profileId={creator.id} size={24} />
                                        <div className="user-name">{creator.first_name + " " + creator.last_name}</div>
                                    </div>
                                </div>
                            }
                            {last_change_by &&
                                <div className="d-flex">
                                    {translate("task.module.menu.last-changed.title")}:&nbsp;
                                    <div className="d-flex task-user">
                                        <UserProfileAvatar profileId={last_change_by.id} size={24} />
                                        <div className="user-name">{last_change_by.first_name + " " + last_change_by.last_name}</div>
                                    </div>
                                </div>
                            }
                            {task.updated_at && <div>{translate("task.state.changed")}:<TimeComponent date={task.updated_at} /></div>}
                        </div>
                        <div className="task-tags">{task.tags}</div>
                    </div>
                    <ModuleFooter className="mt-1">
                        {responsible &&
                            <div className="d-flex">
                                {translate("task.responsible")}:&nbsp;
                                <div className="d-flex task-user">
                                    <UserProfileAvatar profileId={responsible.id} size={16} />
                                    <div className="user-name">{responsible.first_name + " " + responsible.last_name}</div>
                                </div>
                            </div>
                        }
                        {assigned && <div className="d-flex"> {translate("task.assigned_to")}:&nbsp;
                            {assigned.map((user) => {
                            return <div className="d-flex task-user">
                                <UserProfileAvatar profileId={user.id} size={16} />
                                <div className="user-name">{user.first_name + " " + user.last_name}</div>
                            </div>
                        })}
                        </div>}
                    </ModuleFooter>
                </>
            }
        </Module>)
    }
}
export default withContextData(withRouter(TaskDetailsModule))