import * as React from "react";
import "./EventPage.scss"
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
class EventPage extends React.Component<Props, State>
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
        const {community, event, loading} = this.props.contextData
        const hasData = !!community && !!event
        if(loading && !hasData)
            return this.renderLoading()
        if(!hasData)
            return this.renderNotFound()
        return <div className="content">
                    <DashboardWithData category="event" />
                </div>
    }
    render() {
        return(
            <div id="event-page" className="dashboard-container">
                {this.renderContent()}
            </div>
        );
    }
}
export default withContextData(EventPage);