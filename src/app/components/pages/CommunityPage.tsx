import * as React from "react";
import { connect } from 'react-redux'
import "./CommunityPage.scss"
import { Community } from "../../types/intrasocial_types";
import { CommunityManager } from '../../managers/CommunityManager';
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
    componentDidMount = () => {
        if (this.props.communityid)
            CommunityManager.ensureCommunityExists(this.props.communityid, null, true)
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
        const hasData = !!community
        return(
            <div id="project-page" className="dashboard-container">
                {!hasData && this.renderNotFound()}
                {hasData &&
                    <div className="content">
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
    return {
        community,
        communityid,
    }
}
export default connect<ReduxStateProps, null, OwnProps>(mapStateToProps, null)(CommunityPage);