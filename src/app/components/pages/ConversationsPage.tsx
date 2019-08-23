import * as React from "react";
import { connect } from 'react-redux'
import "./ConversationsPage.scss"
import { Community } from "../../types/intrasocial_types";
import { CommunityManager } from "../../managers/CommunityManager";
import LoadingSpinner from "../LoadingSpinner";
import { ReduxState } from "../../redux";
import { DashboardWithData } from "../../DashboardWithData";
import { Error404 } from '../../views/error/Error404';
export interface OwnProps 
{
    updateKey?:string
}
interface ReduxStateProps 
{
}
interface ReduxDispatchProps 
{
    community:Community
}
interface State 
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class ConversationsPage extends React.Component<Props, State> 
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
    renderNotFound = () => {
        return <Error404 />
    }
    render() {
        return(
            <div id="conversations-page" className="dashboard-container">
                <div className="content">
                    <DashboardWithData category="conversations" updateKey={this.props.updateKey} />
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps:OwnProps) => {
    const community = CommunityManager.getActiveCommunity()
    return {
        community,
    }
}
export default connect<ReduxStateProps, null, OwnProps>(mapStateToProps, null)(ConversationsPage);