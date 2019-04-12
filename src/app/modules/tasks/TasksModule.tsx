import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import classnames from "classnames"
import "./TasksModule.scss"
import ModuleMenu from '../ModuleMenu';
import ModuleMenuTrigger from '../ModuleMenuTrigger';
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import TaskMenu, { TasksMenuData } from './TasksMenu';
import { ContextNaturalKey, TaskActions, Task } from '../../types/intrasocial_types';
import { ReduxState } from '../../redux';
import { connect } from 'react-redux';
import { resolveContextObject, ResolvedContextObject } from '../newsfeed/NewsfeedModule';
import { ProjectManager } from '../../managers/ProjectManager';
import ListComponent from '../../components/general/ListComponent';
import ApiClient, { PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import TaskListItem from './TaskListItem';
import { StatusUtilities } from '../../utilities/StatusUtilities';
import LoadingSpinner from '../../components/LoadingSpinner';

type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
}
type State = {
    menuVisible:boolean
    isLoading:boolean
    menuData:TasksMenuData
}

type ReduxStateProps = {
    contextObjectId:number
    isResolvingContext:boolean
    resolvedContext: ResolvedContextObject
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxDispatchProps & ReduxStateProps
class TasksModule extends React.Component<Props, State> {  
    tempMenuData:TasksMenuData = null   
    taskList = React.createRef<ListComponent<Task>>()
    constructor(props:Props) {
        super(props);
        this.state = {
            menuVisible:false,
            isLoading:false,
            menuData:{
                project:null,
                state: [],
                priority: [],
                assignedTo: null,
                responsible: null,
                tags: [],
                category: null,
                term: null,
                creator:null,
                notAssigned:null,
            }
        }
    }
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        if(!this.props.isResolvingContext && this.contextDataChanged(prevState.menuData, prevProps))
        {
            this.taskList.current.reload()
        }
        //turn off loading spinner if feed is removed
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    headerClick = (e) => {
        const context = this.state.menuData.project
        //NavigationUtilities.navigateToNewsfeed(this.props.history, context && context.type, context && context.id, this.state.includeSubContext)
    }
    menuItemClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const visible = !this.state.menuVisible
        const newState:any = {menuVisible:visible}
        if(!visible && this.tempMenuData)
        {
            newState.menuData = this.tempMenuData
            this.tempMenuData = null
        }
        this.setState(newState)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    renderLoading = () => {
        if (this.state.isLoading) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>)
        }
    }
    menuDataUpdated = (data:TasksMenuData) => {
        this.tempMenuData = data
    }
    contextDataChanged = (prevData:TasksMenuData, prevProps:Props) => {
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
                prevProps.contextObjectId != this.props.contextObjectId
    }
    getContextData = () => {
        if(this.props.contextObjectId)
        {
            const data = this.state.menuData
            if(!data.project)
            {
                const resolvedId = this.props.resolvedContext && this.props.resolvedContext.contextObjectId
                let name = ""
                if(resolvedId)
                    name = ProjectManager.getProject(resolvedId.toString()).name

                data.project = {label:`[${name}]`, id:this.props.contextObjectId, type:this.props.contextNaturalKey, value:this.props.contextNaturalKey + "_" + this.props.contextObjectId}
            }
            return data
        }
        return this.state.menuData
    }
    updateTaskItem = (task:Task) => 
    {
        task.serialization_date = new Date().toISOString()
        this.taskList.current.updateItem(task)
    }
    updateTimeSpent(task:Task, hours:number, minutes:number)
    {
        task.updated_at = new Date().toISOString()
        task.serialization_date = new Date().toISOString()
    }
    navigateToAction = (task:Task, action:TaskActions, extra?:any, completion?:(success:boolean) => void) => 
    {
        const logWarn = () => 
        {
            console.warn("Missing Action handler for: ", action, extra)
        }
        switch(action)
        {
            case TaskActions.setPriority:
            {
                if(task.priority != extra.priority)
                {
                    ApiClient.updateTask(task.id, {priority:extra.priority}, (data, status, error) => {
                        const success = !!data
                        if(success)
                        {
                            this.updateTaskItem(data)
                            ToastManager.showInfoToast(translate("task.state.changed"), `${translate("task.priority." + task.priority)} > ${translate("task.priority." + data.priority)}`)
                        }
                        completion && completion(success)
                        ToastManager.showErrorToast(error)
                    })
                }
                else {
                    completion && completion(false)
                }
                break;
            }
            case TaskActions.setState:
            {
                if(task.state != extra.state)
                {
                    ApiClient.updateTask(task.id, {state:extra.state}, (data, status, error) => {
                        const success = !!data
                        if(success)
                        {
                            this.updateTaskItem(data)
                            ToastManager.showInfoToast(translate("task.state.changed"), `${translate("task.state." + task.state)} > ${translate("task.state." + data.state)}`)
                        }
                        completion && completion(success)
                        ToastManager.showErrorToast(error)
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
                    if(success)
                    {
                        const taskClone = {...task}
                        this.updateTimeSpent(taskClone, timesheet.hours, timesheet.minutes)
                        this.updateTaskItem(taskClone)
                        ToastManager.showInfoToast(translate("task.timesheet.added"))
                    }
                    completion && completion(success)
                    ToastManager.showErrorToast(error)
                })
                break;
            }
            case TaskActions.addStatus:
            {
                const tempStatus = StatusUtilities.getStatusPreview(ContextNaturalKey.TASK, task.id, extra.message, extra.mentions, extra.files)
                ApiClient.createStatus(tempStatus, (newStatus, requestStatus, error) => {
                    const success = !!newStatus
                    if(success)
                    {
                        ToastManager.showInfoToast(translate("task.status.added"))
                    }
                    completion && completion(success)
                    ToastManager.showErrorToast(error)
                })
                break;
            }
            default:logWarn()
        }
    }
    navigateToActionWithTask = (taskId:number) => (action:TaskActions, extra?:any, completion?:(success:boolean) => void) => 
    {
        const task = this.taskList.current.getItemById(taskId)
        this.navigateToAction(task, action, extra, completion)
    }
    fetchTasks = (offset:number, completion:(items:PaginationResult<Task>) => void ) => {
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
        ApiClient.getTasks(30, offset,project, state, priority, tags, assignedTo, responsible, creator, notAssigned, category, term, (data, status, error) => {
            completion(data)
            ToastManager.showErrorToast(error)
        })
    }
    renderTask = (task:Task) =>  {
        return <TaskListItem  
                onActionPress={this.navigateToActionWithTask(task.id)}
                task={task}
                communityId={-1}
                key={"task_"+task.id} />
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, className, isResolvingContext, contextObjectId, contextNaturalKey, resolvedContext, ...rest} = this.props
        const cn = classnames("tasks-module", className, {"menu-visible":this.state.menuVisible})
        const headerClick = breakpoint < ResponsiveBreakpoint.standard ? this.headerClick : undefined
        const headerClass = classnames({link:headerClick})
        const headerSubtitle = this.state.menuData.project && this.state.menuData.project.label
        return (<Module {...rest} className={cn}>
                    <ModuleHeader className={headerClass} onClick={headerClick}>
                        <div className="flex-grow-1 text-truncate d-flex align-items-center">
                            <div className="text-truncate module-header-title-left">{translate("task.module.title")}</div>
                            {this.renderLoading()}
                            <div className="spacer flex-grow-1 flex-shrink-1"></div>
                            {!!headerSubtitle && 
                                <div className="module-header-title-right text-truncate">{headerSubtitle}</div>
                            }
                        </div>
                        <ModuleMenuTrigger onClick={this.menuItemClick} />
                    </ModuleHeader>
                    {breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <>
                            <ModuleContent>
                                {isResolvingContext && <LoadingSpinner key="loading"/>}
                                {!isResolvingContext && <ListComponent<Task> ref={this.taskList} onLoadingStateChanged={this.feedLoadingStateChanged} fetchData={this.fetchTasks} renderItem={this.renderTask} />}
                            </ModuleContent>
                        </>
                    }
                    <ModuleMenu visible={this.state.menuVisible}>
                        <TaskMenu 
                            data={this.state.menuData}
                            onUpdate={this.menuDataUpdated}  />
                    </ModuleMenu>
                </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {

    const resolveContext = state.resolvedContext
    const resolvedContext = resolveContextObject(resolveContext, ownProps.contextNaturalKey)
    const isResolvingContext = resolvedContext && (!resolvedContext.contextObjectId && !resolvedContext.resolved)
    return {
        contextObjectId:resolvedContext && resolvedContext.contextObjectId,
        isResolvingContext,
        resolvedContext
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(TasksModule))