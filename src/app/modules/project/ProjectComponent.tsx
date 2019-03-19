import * as React from 'react'
import classnames from "classnames"
import { withRouter, RouteComponentProps } from "react-router-dom"
import "./ProjectComponent.scss"
import { SimpleTask, TaskActions, Task } from '../../types/intrasocial_types';
import { ToastManager } from '../../managers/ToastManager';
import ApiClient from '../../network/ApiClient';
import { List } from '../../components/general/List';
import TaskListItem from './TaskListItem';
import { ProjectMenuData } from './ProjectMenu';
import LoadingSpinner from '../../components/LoadingSpinner';
import { translate } from '../../localization/AutoIntlProvider';

type OwnProps = {
    className?:string
    onLoadingStateChanged?:(isLoading:boolean) => void
    contextData:ProjectMenuData
    limit?:number
    scrollParent?:any
}
type State = {
    items:SimpleTask[]
    offset:number
    isLoading: boolean
    isRefreshing: boolean
    hasMore:boolean
}
type Props = OwnProps & RouteComponentProps<any>
class ProjectComponent extends React.Component<Props, State> {  
    static defaultProps:OwnProps = {
        limit:30,
        contextData:null,
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            isRefreshing:false,
            items:[],
            offset:0,
            hasMore:true,
        }
    }
    componentDidMount = () => 
    {
        if(this.props.scrollParent)
        {
            this.props.scrollParent.addEventListener("scroll", this.onScroll)
        }
        this.setState({
            isLoading: true
        }, this.loadTasks);
    }
    contextDataChanged = (prevData:ProjectMenuData) => {
        const data = this.props.contextData
        return !prevData.state.isEqual(data.state) || 
                !prevData.tags.isEqual(data.tags) || 
                !prevData.priority.isEqual(data.priority) || 
                prevData.project != data.project || 
                prevData.assignedTo != data.assignedTo || 
                prevData.creator != data.creator || 
                prevData.notAssigned != data.notAssigned ||
                prevData.category != data.category || 
                prevData.responsible != data.responsible || 
                prevData.term != data.term
    }
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        if(this.contextDataChanged(prevProps.contextData))
        {
            this.setState({
                offset: 0,
                isRefreshing: true,
                isLoading: true,
                items:[],
            }, this.loadTasks);
        }
        if(this.props.onLoadingStateChanged && prevState.isLoading != this.state.isLoading)
        {
            this.props.onLoadingStateChanged(this.state.isLoading)
        }
    }
    onScroll = (event:any) =>
    {
        let isAtBottom = false
        if(event.target instanceof Document)
            isAtBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight
        else 
            isAtBottom = event.target.scrollTop + event.target.offsetHeight >= event.target.scrollHeight
        if(isAtBottom)
        {
            this.handleLoadMore()
        }
    }
    handleLoadMore = () => 
    {
        if(!this.state.hasMore || this.state.isLoading)
        {
            return
        }
        this.setState({
            offset: this.state.offset + this.props.limit,
            isLoading: true
        }, this.loadTasks);
    }
    loadTasks = () => 
    {
        const { items, offset } = this.state
        const { limit } = this.props
        const data = this.props.contextData
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
        ApiClient.getTasks(limit, offset,project, state, priority, tags, assignedTo, responsible, creator, notAssigned, category, term, (data, status, error) => {
            if(data && data.results)
            {
                let newData = data.results
                this.setState({
                    items: offset == 0 ?  newData :  [...items, ...newData],
                    isRefreshing: false,
                    hasMore:data.next != null,
                    isLoading:false
                });
            }
            ToastManager.showErrorToast(error)
        })
    }
    renderLoading = () => {
        if (this.state.isLoading) {
            return (<LoadingSpinner key="loading"/>)
        }
        return null
    }
    updateTimeSpent(task:Task, hours:number, minutes:number)
    {
        /*
        if(task.spent_time)
        {
            task.spent_time[0] += hours
            task.spent_time[1] += minutes
        }
        else
        {
            task.spent_time = [hours, minutes]
        }*/
        task.updated_at = new Date().toISOString()
        task.serialization_date = new Date().toISOString()
    }
    updateTaskItem = (task:Task) => 
    {
        const index = this.state.items.findIndex(t => t.id == task.id)
        let stateItems = this.state.items
        task.serialization_date = new Date().toISOString()
        stateItems[index!] = task
        this.setState({items:stateItems})
    }
    navigateToAction = (task:SimpleTask, action:TaskActions, extra?:any, completion?:(success:boolean) => void) => 
    {
        const logWarn = () => 
        {
            console.warn("Missing Action handler for: ", action, extra)
        }
        switch(action)
        {
            case TaskActions.setPriority:
            {
                ApiClient.updateTask(task.id, {priority:extra.priority}, (data, status, error) => {
                    if(data)
                    {
                        this.updateTaskItem(data)
                        ToastManager.showInfoToast(translate("task.state.changed"), `${translate("task.priority." + task.priority)} > ${translate("task.priority." + data.priority)}`)
                    }
                    ToastManager.showErrorToast(error)
                })
                break;
            }
            case TaskActions.setState:
            {
                ApiClient.updateTask(task.id, {state:extra.state}, (data, status, error) => {
                    if(data)
                    {
                        this.updateTaskItem(data)
                        ToastManager.showInfoToast(translate("task.state.changed"), `${translate("task.state." + task.state)} > ${translate("task.state." + data.state)}`)
                    }
                    ToastManager.showErrorToast(error)
                })
                break;
            }
            case TaskActions.addTime:
            {
                ApiClient.createTimesheet(task.id, extra.description, extra.date, extra.hours, extra.minutes, (timesheet, status, error) => {
                    
                    if(!!timesheet)
                    {
                        const taskClone = {...task}
                        this.updateTimeSpent(taskClone, timesheet.hours, timesheet.minutes)
                        this.updateTaskItem(taskClone)
                        ToastManager.showInfoToast(translate("task.timesheet.added"))
                    }
                    ToastManager.showErrorToast(error)
                })
            }
            default:logWarn()
        }
    }
    navigateToActionWithId = (taskId:number) => (action:TaskActions, extra?:any, completion?:(success:boolean) => void) => 
    {
        const task = this.state.items.find(t => t.id == taskId)
        this.navigateToAction(task, action, extra, completion)
    }
    renderTasks = () => {
        const cn = classnames("task-list vertical-scroll")
        const scroll = this.props.scrollParent ? undefined : this.onScroll
        return (<List enableAnimation={false} 
                    onScroll={scroll} 
                    className={cn}>
                    {this.state.items.map(i => {
                        return <TaskListItem 
                            onActionPress={this.navigateToActionWithId(i.id)}
                            task={i}
                            communityId={-1}
                            key={"task_"+i.id} />
                    }).concat(this.renderLoading())}
                </List>)
        
    }
    render()
    {
        const cn = classnames("project-component")
        return (<div className={cn}>
                {this.renderTasks()}
                </div>)
    }
}
export default withRouter(ProjectComponent)