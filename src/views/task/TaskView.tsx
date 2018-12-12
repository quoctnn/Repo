import * as React from "react";
import { connect } from 'react-redux'
import { RootState } from "../../reducers";
import { Task } from "../../types/intrasocial_types";
import { TaskManager } from "../../managers/TaskManager";
import LoadingSpinner from "../../components/general/LoadingSpinner";
require("./TaskView.scss");
export interface OwnProps 
{
    match:any,
}
interface ReduxStateProps 
{
    task:Task|null
    id:number
}
interface ReduxDispatchProps 
{
}
interface State 
{
    loading:boolean
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps

class TaskView extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            loading:false
        }
    }
    componentDidMount = () => {
        if(!this.props.task)
        {
            this.setState({loading:true}, () => {
                TaskManager.ensureTaskExists(this.props.id, () => {
                    this.setState({loading:false})
                })
            })
            
        }
    }
    renderLoading = () => 
    {
        if (this.state.loading) {
            return (<LoadingSpinner/>)
        }
    }
    renderTask(task:Task)
    {
        return (
        <div className="content">
            <h2 className="text-truncate">{task.title}</h2>
        </div>)
    }
    render() {
        const task = this.props.task
        return(
            <div id="task-view" className="col-sm">
                {this.renderLoading()}
                {task && this.renderTask(task)}
                {!task && <div>NO TASK</div>}
            </div>
        );
    }
}
const mapStateToProps = (state:RootState, ownProps:OwnProps) => {
    var taskid = ownProps.match.params.taskid
    const task = TaskManager.getTask(taskid)
    return {
        task,
        id:taskid
    }
}
export default connect(mapStateToProps, null)(TaskView);