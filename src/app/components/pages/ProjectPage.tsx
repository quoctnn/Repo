import * as React from "react";
import { connect } from 'react-redux'
import "./ProjectPage.scss"
import { Project, Community } from "../../types/intrasocial_types";
import LoadingSpinner from "../LoadingSpinner";
import { ReduxState } from "../../redux";
import { DashboardWithData } from "../../DashboardWithData";
import { ProjectManager } from "../../managers/ProjectManager";
import { CommunityManager } from "../../managers/CommunityManager";
import { Error404 } from "../../views/error/Error404";
import { RouteComponentProps } from "react-router-dom";
type OwnProps = {
    match:any,
} & RouteComponentProps<any>
interface ReduxStateProps
{
    community:Community
    project:Project
}
interface ReduxDispatchProps
{
}
interface State
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class ProjectPage extends React.Component<Props, State>
{
    constructor(props:Props) {
        super(props);
        this.state = {
            loading:false
        }
    }
    componentDidMount = () => {
        if (this.props.project)
            ProjectManager.ensureProjectExists(this.props.project.id, () => {}, true)
    }
    componentDidUpdate = (prevProps:Props) => {
        const p = prevProps.project
        const c = this.props.project
        const pPath = prevProps.location.pathname
        const cPath = this.props.location.pathname
        if(p && !c && pPath == cPath)
        {
            const obj = ProjectManager.getProjectById(p.id)
            if(obj && obj.uri)
                window.app.navigateToRoute(obj.uri)

        }
    }
    renderLoading = () =>
    {
        return (<LoadingSpinner />)
    }
    renderNotFound = () => {
        return <Error404 />
    }
    render() {
        const { project, community} = this.props
        const hasData = !!project && !!community
        return(
            <div id="project-page" className="dashboard-container">
                {!hasData && this.renderNotFound()}
                {hasData &&
                    <div className="content">
                        <DashboardWithData category="project" />
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
    return {
        community,
        project,
    }
}
export default connect<ReduxStateProps, null, OwnProps>(mapStateToProps, null)(ProjectPage);