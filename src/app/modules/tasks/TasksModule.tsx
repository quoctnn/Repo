import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./TasksModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import TaskMenu, { TasksMenuData } from './TasksMenu';
import { ContextNaturalKey, TaskActions, Task } from '../../types/intrasocial_types';
import ListComponent from '../../components/general/ListComponent';
import {ApiClient,  PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { StatusUtilities } from '../../utilities/StatusUtilities';
import SimpleModule from '../SimpleModule';
import { ButtonGroup, Button } from 'reactstrap';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { CommonModuleProps } from '../Module';
import { withContextData, ContextDataProps } from '../../hoc/WithContextData';
import TaskListItem2 from './TaskListItem2';
import { nameofFactory } from '../../utilities/Utilities';

type OwnProps = {
    breakpoint: ResponsiveBreakpoint
} & CommonModuleProps
type State = {
    menuVisible: boolean
    isLoading: boolean
    menuData: TasksMenuData
}
type Props = OwnProps & RouteComponentProps<any> & ContextDataProps

const nameOf = nameofFactory<Task>()
class TasksModule extends React.Component<Props, State> {
    tempMenuData: TasksMenuData = null
    taskList = React.createRef<ListComponent<Task>>()
    static defaultProps: CommonModuleProps = {
        pageSize: 15,
    }
    constructor(props: Props) {
        super(props);
        this.state = {
            menuVisible: false,
            isLoading: false,
            menuData: {
                project: null,
                state: [],
                priority: [],
                assignedTo: null,
                responsible: null,
                tags: [],
                category: null,
                term: null,
                creator: null,
                notAssigned: null,
            }
        }
    }
    componentWillUnmount = () => {
        this.tempMenuData = null
        this.taskList = null
    }
    componentDidUpdate = (prevProps: Props, prevState: State) => {
        if (this.contextDataChanged(prevState.menuData, prevProps)) {
            this.taskList.current.reload()
        }
        //turn off loading spinner if feed is removed
        if (prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading) {
            this.setState({ isLoading: false })
        }
    }
    headerClick = (e) => {
        const context = this.state.menuData.project
        //NavigationUtilities.navigateToNewsfeed(this.props.history, context && context.type, context && context.id, this.state.includeSubContext)
    }
    feedLoadingStateChanged = (isLoading: boolean) => {
        this.setState({ isLoading })
    }
    menuDataUpdated = (data: TasksMenuData) => {
        //this.tempMenuData = data
        this.setState((prevState:State) => {
            return {menuData:data}
        })
    }
    contextDataChanged = (prevData: TasksMenuData, prevProps: Props) => {
        const data = this.state.menuData
        return !prevData.state.isEqual(data.state) ||
            !prevData.tags.isEqual(data.tags) ||
            !prevData.priority.isEqual(data.priority) ||
            prevData.project != data.project ||
            prevData.assignedTo != data.assignedTo ||
            prevData.creator != data.creator ||
            prevData.notAssigned != data.notAssigned ||
            prevData.category != data.category ||
            prevData.responsible != data.responsible ||
            prevData.term != data.term ||
            prevProps.contextData.project && !this.props.contextData.project ||
            !prevProps.contextData.project && this.props.contextData.project ||
            prevProps.contextData.project && this.props.contextData.project && prevProps.contextData.project.id != this.props.contextData.project.id
    }
    getContextData = () => {
        const data = this.state.menuData
        if (!data.project && this.props.contextNaturalKey == ContextNaturalKey.PROJECT && this.props.contextData.project) {
            const project = this.props.contextData.project
            data.project = { label: `[${project.name}]`, id: project.id, type: this.props.contextNaturalKey, value: this.props.contextNaturalKey + "_" + project.id }
        }
        return data
    }
    updateTaskItem = (task: Task) => {
        task.serialization_date = new Date().toISOString()
        this.taskList.current.updateItem(task)
    }
    updateTimeSpent(task: Task, hours: number, minutes: number) {
        task.updated_at = new Date().toISOString()
        task.serialization_date = new Date().toISOString()
    }
    navigateToAction = (task: Task, action: TaskActions, extra?: any, completion?: (success: boolean) => void) => {
        const logWarn = () => {
            console.warn("Missing Action handler for: ", action, extra)
        }
        switch (action) {
            case TaskActions.setPriority:
                {
                    if (task.priority != extra.priority) {
                        ApiClient.updateTask(task.id, { priority: extra.priority }, (data, status, error) => {
                            const success = !!data
                            if (success) {
                                this.updateTaskItem(data)
                                ToastManager.showInfoToast(translate("task.state.changed"), `${translate("task.priority." + task.priority)} > ${translate("task.priority." + data.priority)}`)
                            }
                            completion && completion(success)
                            ToastManager.showRequestErrorToast(error)
                        })
                    }
                    else {
                        completion && completion(false)
                    }
                    break;
                }
            case TaskActions.setState:
                {
                    if (task.state != extra.state) {
                        ApiClient.updateTask(task.id, { state: extra.state }, (data, status, error) => {
                            const success = !!data
                            if (success) {
                                this.updateTaskItem(data)
                                ToastManager.showInfoToast(translate("task.state.changed"), `${translate("task.state." + task.state)} > ${translate("task.state." + data.state)}`)
                            }
                            completion && completion(success)
                            ToastManager.showRequestErrorToast(error)
                        })
                    }
                    else {
                        completion && completion(false)
                    }
                    break;
                }
            case TaskActions.addTime:
                {
                    ApiClient.createTimesheet(task.id, extra.description, extra.date, extra.hours, extra.minutes, (timesheet, status, error) => {
                        const success = !!timesheet
                        if (success) {
                            const taskClone = { ...task }
                            this.updateTimeSpent(taskClone, timesheet.hours, timesheet.minutes)
                            this.updateTaskItem(taskClone)
                            ToastManager.showInfoToast(translate("task.timesheet.added"), task.title)
                        }
                        completion && completion(success)
                        ToastManager.showRequestErrorToast(error)
                    })
                    break;
                }
            case TaskActions.addStatus:
                {
                    const tempStatus = StatusUtilities.getStatusPreview(ContextNaturalKey.TASK, task.id, extra.message, extra.files)
                    ApiClient.createStatus(tempStatus, (newStatus, requestStatus, error) => {
                        const success = !!newStatus
                        if (success) {
                            ToastManager.showInfoToast(translate("task.status.added"), task.title)
                        }
                        completion && completion(success)
                        ToastManager.showRequestErrorToast(error)
                    })
                    break;
                }
            default: logWarn()
        }
    }
    navigateToActionWithTask = (taskId: number) => (action: TaskActions, extra?: any, completion?: (success: boolean) => void) => {
        const task = this.taskList.current.getItemById(taskId)
        this.navigateToAction(task, action, extra, completion)
    }
    fetchTasks = (offset: number, completion: (items: PaginationResult<Task>) => void) => {
        const data = this.getContextData()
        const project = data.project && data.project.id
        const state = data.state
        const priority = data.priority
        const tags = data.tags
        const assignedTo = data.assignedTo
        const responsible = data.responsible
        const category = data.category
        const term = data.term
        const creator = data.creator
        const notAssigned = data.notAssigned
        ApiClient.getTasks(this.props.pageSize, offset, project, state, priority, tags, assignedTo, responsible, creator, notAssigned, category, term, (data, status, error) => {
            completion(data)
            ToastManager.showRequestErrorToast(error)
        })
    }
    renderTask = (task: Task) => {
        const user = this.props.contextData.authenticatedUser && this.props.contextData.authenticatedUser.id || -1
        return <TaskListItem2
            onActionPress={this.navigateToActionWithTask(task.id)}
            task={task}
            user={user}
            communityId={-1}
            key={"task_" + task.id} />
    }
    renderGroupHeader = (group:string) => {
        return <div key={"header_" + group} className="group-header">
            {group}
        </div>
    }
    renderContent = () => {

        const disableContextSearch = !!this.props.contextNaturalKey
        const project = this.props.contextData.project
        const projectMembers = project.members || []
        return <>
            <TaskMenu projectMembers={projectMembers} data={this.state.menuData} onUpdate={this.menuDataUpdated} disableContextSearch={disableContextSearch} />
             <ListComponent<Task>
            loadMoreOnScroll={!this.props.showLoadMore}
            scrollParent={window}
            ref={this.taskList}
            onLoadingStateChanged={this.feedLoadingStateChanged}
            fetchData={this.fetchTasks}
            renderItem={this.renderTask}
            renderGroupHeader={this.renderGroupHeader}
            className="tasks-list"
            groupField={nameOf("category")}
            />
            </>
    }
    onMenuToggle = (visible: boolean) => {
        const newState: Partial<State> = {}
        newState.menuVisible = visible
        if (!visible && this.tempMenuData) // update menudata
        {
            newState.menuData = this.tempMenuData
            this.tempMenuData = null
        }
        this.setState(newState as State)
    }
    toggleAssignedTo = () => {
        const md = { ...this.state.menuData }
        md.assignedTo = !!md.assignedTo ? undefined : AuthenticationManager.getAuthenticatedUser().id
        this.setState({ menuData: md })
    }
    toggleResponsible = () => {
        const md = { ...this.state.menuData }
        md.responsible = !!md.responsible ? undefined : AuthenticationManager.getAuthenticatedUser().id
        this.setState({ menuData: md })
    }
    toggleCreator = () => {
        const md = { ...this.state.menuData }
        md.creator = !!md.creator ? undefined : AuthenticationManager.getAuthenticatedUser().id
        this.setState({ menuData: md })
    }
    renderFilters = () => {
        if (this.state.menuVisible)
            return null
        return (<ButtonGroup className="header-filter-group">
            <Button size="xs" active={!!this.state.menuData.assignedTo} onClick={this.toggleAssignedTo} color="light">
                <span>A</span>{/* <i className="fas fa-calendar-check"></i>*/}
            </Button>
            <Button size="xs" active={!!this.state.menuData.responsible} onClick={this.toggleResponsible} color="light">
                <span>R</span>{/* <i className="fas fa-user-check"></i>*/}
            </Button>
            <Button size="xs" active={!!this.state.menuData.creator} onClick={this.toggleCreator} color="light">
                <span>C</span>{/* <i className="fas fa-user-check"></i>*/}
            </Button>
        </ButtonGroup>)
    }
    renderModalContent = () => {
        return <TasksModule {...this.props} pageSize={50} style={{ height: undefined, maxHeight: undefined }} showLoadMore={false} showInModal={false} isModal={true} />
    }
    render() {
        const { history, match, location, staticContext, contextNaturalKey, pageSize, showLoadMore, showInModal, isModal, contextData, ...rest } = this.props
        const { breakpoint, className } = this.props
        const cn = classnames("tasks-module", className)
        //const headerContent = this.renderFilters()
        const renderModalContent = !showInModal || isModal ? undefined : this.renderModalContent
        return (<SimpleModule {...rest}
            className={cn}
            headerClick={this.headerClick}
            breakpoint={breakpoint}
            isLoading={this.state.isLoading}
            onMenuToggle={this.onMenuToggle}
            //menu={menu}
            //headerContent={headerContent}
            showHeaderTitle={!isModal}
            renderModalContent={renderModalContent}
            headerTitle={translate("task.module.title")}>
            {this.renderContent()}
        </SimpleModule>)
    }
}
export default withContextData(withRouter(TasksModule))