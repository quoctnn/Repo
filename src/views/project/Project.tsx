import * as React from "react";
import { connect } from 'react-redux'
import { CoverImage } from '../../components/general/CoverImage';
import { RootState } from "../../reducers";
import { Project } from "../../types/intrasocial_types";
require("./Project.scss");
export interface Props {
    match:any,
    projectsData:Project[]
}

class ProjectView extends React.Component<Props, {}> {
    getProject(community:number, slug:string)
    {
        return this.props.projectsData.find((g) => g.community == community && g.slug == slug)
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
        let community = parseInt(this.props.match.params.communityid)
        let slug = this.props.match.params.projectname
        let project = this.getProject(community,slug)
        return(
            <div id="project-view" className="col-sm">
                {project && this.renderProject(project)}
                {!project && <div>NO PROJECT</div>}
            </div>
        );
    }
}
const mapStateToProps = (state:RootState) => {
    return {
        projectsData: state.projectStore.projects,
    };
}
export default connect(mapStateToProps, null)(ProjectView);