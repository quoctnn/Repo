import * as React from "react";
import { connect } from 'react-redux'
import "./ConversationsPage.scss"
import { Community } from "../../types/intrasocial_types";
import { CommunityManager } from "../../managers/CommunityManager";
import LoadingSpinner from "../LoadingSpinner";
import { ReduxState } from "../../redux";
import PageHeader from "../PageHeader";
import { DashboardWithData } from "../../DashboardWithData";
import { Error404 } from '../../views/error/Error404';
import { communityAvatar, communityName, communityCover } from "../../utilities/Utilities";
export interface OwnProps 
{
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
    renderHeader(community:Community)
    {
        return (<PageHeader 
                    coverImage={communityCover(community)} 
                    primaryItemImage={communityAvatar(community, true)} 
                    primaryItemTitle={communityName(community)}  
                    />
                )
    }
    renderNotFound = () => {
        return <Error404 />
    }
    render() {
        const {community} = this.props
        return(
            <div id="conversations-page" className="dashboard-container">
                <div className="content dashboard-container">
                    {this.renderHeader(community)}
                    <DashboardWithData category="conversations" />
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