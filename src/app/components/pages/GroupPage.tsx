import * as React from "react";
import { connect } from 'react-redux'
import "./GroupPage.scss"
import { Group, Community } from "../../types/intrasocial_types";
import LoadingSpinner from "../LoadingSpinner";
import { ReduxState } from "../../redux";
import { DashboardWithData } from "../../DashboardWithData";
import { CommunityManager } from "../../managers/CommunityManager";
import { Error404 } from "../../views/error/Error404";
import { GroupManager } from "../../managers/GroupManager";
import { RouteComponentProps } from "react-router";
type OwnProps = {
    match:any,
} & RouteComponentProps<any>
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
class GroupPage extends React.Component<Props, State>
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
    componentDidUpdate = (prevProps:Props) => {
        const p = prevProps.group
        const c = this.props.group
        const pPath = prevProps.location.pathname
        const cPath = this.props.location.pathname
        if(p && !c && pPath == cPath)
        {
            const obj = GroupManager.getGroupById(p.id)
            if(obj && obj.uri)
                window.app.navigateToRoute(obj.uri)

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
        const {group, community} = this.props
        const hasData = !!group && !!community
        return(
            <div id="group-page" className="dashboard-container">
                {!hasData && this.renderNotFound()}
                {hasData &&
                    <div className="content">
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
export default connect<ReduxStateProps, null, OwnProps>(mapStateToProps, null)(GroupPage);