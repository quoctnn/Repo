import * as React from "react";
import { connect } from 'react-redux'
import "./TaskPage.scss"
import { Project, Community, Task } from "../../types/intrasocial_types";
import LoadingSpinner from "../LoadingSpinner";
import { ReduxState } from "../../redux";
import PageHeader from "../PageHeader";
import { DashboardWithData } from "../../DashboardWithData";
import { ProjectManager } from "../../managers/ProjectManager";
import { CommunityManager } from "../../managers/CommunityManager";
import { Error404 } from "../../views/error/Error404";
import { TaskManager } from "../../managers/TaskManager";
import { communityAvatar, communityName, communityCover } from "../../utilities/Utilities";
export interface OwnProps 
{
    match:any,
}
interface ReduxStateProps 
{
    community:Community
    communityResolved:number

    project:Project
    projectResolved:number

    taskid:string
    task:Task
    taskResolved:number

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
    renderLoading = () => 
    {
        return (<LoadingSpinner />)
    }
    renderHeader(community:Community)
    {
        return (<PageHeader 
                    coverImage={communityCover(community)} 
                    primaryItemImage={communityAvatar(community)} 
                    primaryItemTitle={communityName(community)}  
                    />
                )
    }
    renderNotFound = () => {
        return <Error404 />
    }
    render() {
        const { task, taskResolved ,project, projectResolved, community, communityResolved} = this.props
        const hasData = !!task && !!project && !!community
        const isLoading = (!task && !taskResolved) || (!project && !projectResolved) || (!community && !communityResolved)
        return(
            <div id="task-page" className="dashboard-container">
                {isLoading && this.renderLoading()}
                {!isLoading && !hasData && this.renderNotFound()}
                {hasData && 
                    <div className="content dashboard-container">
                        {this.renderHeader(community)}
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
    const projectResolved = state.resolvedContext.projectResolved

    const communityid:string = ownProps.match.params.communityname
    const community = CommunityManager.getCommunity(communityid)
    const communityResolved = state.resolvedContext.communityResolved

    const taskid:string = ownProps.match.params.taskid
    const task = TaskManager.getTask(taskid)
    const taskResolved = state.resolvedContext.taskResolved
    return {
        community,
        communityResolved,
        project,
        projectResolved,
        taskid,
        task,
        taskResolved,
    }
}
export default connect<ReduxStateProps, null, OwnProps>(mapStateToProps, null)(TaskPage);