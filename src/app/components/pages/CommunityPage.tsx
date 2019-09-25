import * as React from "react";
import { connect } from 'react-redux'
import "./CommunityPage.scss"
import { Community } from "../../types/intrasocial_types";
import { CommunityManager } from '../../managers/CommunityManager';
import LoadingSpinner from "../LoadingSpinner";
import { ReduxState } from "../../redux";
import { DashboardWithData } from "../../DashboardWithData";
import { Error404 } from '../../views/error/Error404';import { RouteComponentProps } from "react-router";
type OwnProps = {
    match:any,
} & RouteComponentProps<any>
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
    componentDidUpdate = (prevProps:Props) => {
        const p = prevProps.community
        const c = this.props.community
        const pPath = prevProps.location.pathname
        const cPath = this.props.location.pathname
        if(p && !c && pPath == cPath)
        {
            const obj = CommunityManager.getCommunityById(p.id)
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
        const {community} = this.props
        const hasData = !!community
        return(
            <div id="project-page" className="dashboard-container">
                {!hasData && this.renderNotFound()}
                {hasData &&
                    <div className="content">
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