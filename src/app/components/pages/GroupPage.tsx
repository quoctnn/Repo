import * as React from "react";
import { connect } from 'react-redux'
import "./GroupPage.scss"
import { Group, Community } from "../../types/intrasocial_types";
import LoadingSpinner from "../LoadingSpinner";
import { ReduxState } from "../../redux";
import PageHeader from "../PageHeader";
import { DashboardWithData } from "../../DashboardWithData";
import { CommunityManager } from "../../managers/CommunityManager";
import { Error404 } from "../../views/error/Error404";
import { GroupManager } from "../../managers/GroupManager";
import { communityAvatar, communityName, communityCover, groupCover } from "../../utilities/Utilities";
import { translate } from "../../localization/AutoIntlProvider";
export interface OwnProps 
{
    match:any,
}
interface ReduxStateProps 
{
    community:Community
    communityResolved:number
    groupid:string
    group:Group
    groupResolved:number
}
interface ReduxDispatchProps 
{
}
interface State 
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class ProjectPage extends React.Component<Props, State> 
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
    renderHeader(group:Group, community:Community)
    {
        return (<PageHeader 
                    coverImage={groupCover(group)} 
                    primaryItemImage={communityAvatar(community, true)} 
                    primaryItemTitle={communityName(community)}  
                    />
                )
    }
    renderNotFound = () => {
        return <Error404 />
    }
    render() {
        const {group, groupResolved, community, communityResolved} = this.props
        const hasData = !!group && !!community
        const isLoading = (!group && !groupResolved) || (!community && !communityResolved)
        return(
            <div id="group-page" className="dashboard-container">
                {isLoading && this.renderLoading()}
                {!isLoading && !hasData && this.renderNotFound()}
                {hasData && 
                    <div className="content dashboard-container">
                        {this.renderHeader(group, community)}
                        <DashboardWithData category="group" />
                    </div>
                }
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps:OwnProps) => {
    const groupid:string = ownProps.match.params.groupname
    const group = GroupManager.getGroup(groupid)
    const groupResolved = state.resolvedContext.groupResolved

    const communityid:string = ownProps.match.params.communityname
    const community = CommunityManager.getCommunity(communityid)
    const communityResolved = state.resolvedContext.communityResolved
    return {
        community,
        communityResolved,
        groupid,
        group,
        groupResolved,
    }
}
export default connect<ReduxStateProps, null, OwnProps>(mapStateToProps, null)(ProjectPage);