import * as React from "react";
import { connect } from 'react-redux'
import "./TaskPage.scss"
import { Project, Community, Task } from "../../types/intrasocial_types";
import LoadingSpinner from "../LoadingSpinner";
import { ReduxState } from "../../redux";
import { DashboardWithData } from "../../DashboardWithData";
import { ProjectManager } from "../../managers/ProjectManager";
import { CommunityManager } from "../../managers/CommunityManager";
import { Error404 } from "../../views/error/Error404";
import { TaskManager } from "../../managers/TaskManager";
export interface OwnProps
{
    match:any,
}
interface ReduxStateProps
{
    community:Community
    project:Project
    task:Task
}
interface ReduxDispatchProps
{
}
interface State
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class TaskPage extends React.Component<Props, State>
{
    constructor(props:Props) {
        super(props);
        this.state = {
            loading:false
        }
    }
    componentDidMount = () => {
        if (this.props.task)
            TaskManager.ensureTaskExists(this.props.task.id, () => {}, true)
    }
    renderLoading = () =>
    {
        return (<LoadingSpinner />)
    }
    renderNotFound = () => {
        return <Error404 />
    }
    render() {
        const { task ,project, community} = this.props
        const hasData = !!task && !!project && !!community
        return(
            <div id="task-page" className="dashboard-container">
                {!hasData && this.renderNotFound()}
                {hasData &&
                    <div className="content">
                        <DashboardWithData category="task" />
                    </div>
                }
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps:OwnProps) => {
    const projectid:string = ownProps.match.params.projectname
    const project = ProjectManager.getProject(projectid)

    const communityid:string = ownProps.match.params.communityname
    const community = CommunityManager.getCommunity(communityid)

    const taskid:string = ownProps.match.params.taskid
    const task = TaskManager.getTask(taskid)
    return {
        community,
        project,
        task,
    }
}
export default connect<ReduxStateProps, null, OwnProps>(mapStateToProps, null)(TaskPage);