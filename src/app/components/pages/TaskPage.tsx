import * as React from "react";
import "./TaskPage.scss"
import LoadingSpinner from "../LoadingSpinner";
import { DashboardWithData } from "../../DashboardWithData";
import { Error404 } from "../../views/error/Error404";
import { withContextData, ContextDataProps } from '../../hoc/WithContextData';
interface OwnProps
{
}
interface State
{
}
type Props = ContextDataProps & OwnProps
class TaskPage extends React.Component<Props, State>
{
    constructor(props:Props) {
        super(props);
        this.state = {
            loading:false
        }
    }
    renderLoading = () => {
        return <LoadingSpinner />
    }
    renderNotFound = () => {
        return <Error404 />
    }
    renderContent = () => {
        const {community, project, task, loading} = this.props.contextData
        const hasData = !!community && !!project && !!task
        if(loading && !hasData)
            return this.renderLoading()
        if(!hasData)
            return this.renderNotFound()
        return <div className="content">
                    <DashboardWithData category="task" />
                </div>
    }
    render() {
        return(
            <div id="task-page" className="dashboard-container">
                {this.renderContent()}
            </div>
        );
    }
}
export default withContextData(TaskPage);