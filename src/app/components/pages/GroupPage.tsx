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
import { communityAvatar, communityName, groupCover } from "../../utilities/Utilities";
export interface OwnProps
{
    match:any,
}
interface ReduxStateProps
{
    community:Community
    group:Group
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
    componentDidMount = () => {
        if (this.props.group)
            GroupManager.ensureGroupExists(this.props.group.id, () => {}, true)
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
        const {group, community} = this.props
        const hasData = !!group && !!community
        return(
            <div id="group-page" className="dashboard-container">
                {!hasData && this.renderNotFound()}
                {hasData &&
                    <div className="content">
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

    const communityid:string = ownProps.match.params.communityname
    const community = CommunityManager.getCommunity(communityid)
    return {
        community,
        group,
    }
}
export default connect<ReduxStateProps, null, OwnProps>(mapStateToProps, null)(ProjectPage);