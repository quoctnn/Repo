import * as React from "react";
import "./GroupPage.scss"
import LoadingSpinner from "../LoadingSpinner";
import { DashboardWithData } from "../../DashboardWithData";
import { Error404 } from "../../views/error/Error404";
import { ContextDataProps, withContextData } from '../../hoc/WithContextData';
type OwnProps = {
}
interface State
{
}
type Props = ContextDataProps & OwnProps
class GroupPage extends React.Component<Props, State>
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
        const {community, group, loading} = this.props.contextData
        const hasData = !!community && !!group
        if(loading && !hasData)
            return this.renderLoading()
        if(!hasData)
            return this.renderNotFound()
        return <div className="content">
                    <DashboardWithData category="group" />
                </div>
    }
    render() {
        return(
            <div id="group-page" className="dashboard-container">
                {this.renderContent()}
            </div>
        );
    }
}
export default withContextData(GroupPage)