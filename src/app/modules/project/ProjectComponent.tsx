import * as React from 'react'
import classnames from "classnames"
import { withRouter, RouteComponentProps } from "react-router-dom"
import "./ProjectComponent.scss"
import { SimpleTask } from '../../types/intrasocial_types';
import { ToastManager } from '../../managers/ToastManager';
import ApiClient from '../../network/ApiClient';
import { List } from '../../components/general/List';
import TaskListItem from './TaskListItem';
import { ProjectMenuData } from './ProjectMenu';

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
        return !prevData.statusFilter.isEqual(data.statusFilter) || 
                !prevData.tags.isEqual(data.tags) || 
                prevData.project != data.project || 
                prevData.assignedTo != data.assignedTo || 
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
        const statusFilter = data.statusFilter
        ApiClient.getTasks(limit, offset,project, statusFilter,(data, status, error) => {
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
    renderTasks = () => {
        const cn = classnames("task-list vertical-scroll")
        const scroll = this.props.scrollParent ? undefined : this.onScroll
        return (<List enableAnimation={false} 
                    onScroll={scroll} 
                    className={cn}>
                    {this.state.items.map(i => {
                        return <TaskListItem task={i} key={"task_"+i.id} />
                    })}
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