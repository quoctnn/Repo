import * as React from "react";
import "./ProjectPage.scss"
import LoadingSpinner from "../LoadingSpinner";
import { DashboardWithData } from "../../DashboardWithData";
import { Error404 } from "../../views/error/Error404";
import { withContextData, ContextDataProps } from "../../hoc/WithContextData";

type OwnProps = {
   
}
interface State
{
}
type Props = ContextDataProps & OwnProps
class ProjectPage extends React.Component<Props, State>
{
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    renderLoading = () => {
        return <LoadingSpinner />
    }
    renderNotFound = () => {
        return <Error404 />
    }
    renderContent = () => {
        const {community, project, loading} = this.props.contextData
        const hasData = !!community && !!project
        if(loading && !hasData)
            return this.renderLoading()
        if(!hasData)
            return this.renderNotFound()
        return <div className="content">
                    <DashboardWithData category="project" />
                </div>
    }
    render() {
        return(
            <div id="project-page" className="dashboard-container">
                {this.renderContent()}
            </div>
        );
    }
}
export default withContextData(ProjectPage);