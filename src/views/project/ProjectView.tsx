import * as React from "react";
import { connect } from 'react-redux'
import { CoverImage } from '../../components/general/CoverImage';
import { RootState } from "../../reducers";
import { Project } from "../../types/intrasocial_types";
import { ProjectManager } from "../../managers/ProjectManager";
import LoadingSpinner from "../../components/general/LoadingSpinner";
require("./ProjectView.scss");
export interface OwnProps 
{
    match:any,
}
interface ReduxStateProps 
{
    project:Project|null
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
class ProjectView extends React.Component<Props, State> 
{
    constructor(props) {
        super(props);
        this.state = {
            loading:false
        }
    }
    componentDidMount = () => {
        if(!this.props.project)
        {
            this.setState({loading:true}, () => {
                ProjectManager.ensureProjectExists(this.props.id, () => {
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
    renderProject(project:Project)
    {
        return (
        <div className="content">
            <CoverImage src={project.cover || project.cover_cropped}>
                <div className="down-shadow profile-name text-truncate">
                    <h2 className="text-truncate">{project.name}</h2>
                </div>
            </CoverImage>
        </div>)
    }
    render() {
        const project = this.props.project
        return(
            <div id="project-view" className="col-sm">
                {this.renderLoading()}
                {project && this.renderProject(project)}
                {!project && <div>NO PROJECT</div>}
            </div>
        );
    }
}
const mapStateToProps = (state:RootState, ownProps:OwnProps) => {
    const projectid:string = ownProps.match.params.projectname
    const project = ProjectManager.getProject(projectid)
    return {
        project,
        id:projectid
    }
}
export default connect(mapStateToProps, null)(ProjectView);