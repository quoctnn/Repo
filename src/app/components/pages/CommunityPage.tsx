import * as React from "react";
import { connect } from 'react-redux'
import "./CommunityPage.scss"
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
    match:any,
}
interface ReduxStateProps 
{
    communityid:string
    community:Community
    communityResolved:number
}
interface ReduxDispatchProps 
{
}
interface State 
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class CommunityPage extends React.Component<Props, State> 
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
        const {community, communityResolved} = this.props
        const hasData = !!community
        const isLoading = !community && !communityResolved
        return(
            <div id="project-page" className="dashboard-container">
                {isLoading && this.renderLoading()}
                {!isLoading && !hasData && this.renderNotFound()}
                {hasData && 
                    <div className="content dashboard-container">
                        {this.renderHeader(community)}
                        <DashboardWithData category="community" />
                    </div>
                }
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps:OwnProps) => {
    const communityid:string = ownProps.match.params.communityname
    const community = CommunityManager.getCommunity(communityid)
    const communityResolved = state.resolvedContext.communityResolved
    return {
        community,
        communityid,
        communityResolved
    }
}
export default connect<ReduxStateProps, null, OwnProps>(mapStateToProps, null)(CommunityPage);