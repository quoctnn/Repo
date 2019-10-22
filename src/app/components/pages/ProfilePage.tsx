import * as React from "react";
import "./ProfilePage.scss"
import { DashboardWithData } from "../../DashboardWithData";
import { Error404 } from '../../views/error/Error404';
import { withContextData, ContextDataProps } from '../../hoc/WithContextData';
import LoadingSpinner from "../LoadingSpinner";
type OwnProps = {
}
interface State
{
}
type Props = ContextDataProps & OwnProps
class ProfilePage extends React.Component<Props, State>
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
        const {profile, loading} = this.props.contextData
        const hasData = !!profile
        if(loading && !hasData)
            return this.renderLoading()
        if(!hasData)
            return this.renderNotFound()
        return <div className="content">
                    <DashboardWithData category="profile" />
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
export default withContextData(ProfilePage);