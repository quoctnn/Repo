import * as React from "react";
import { connect } from 'react-redux'
import "./DashboardPage.scss"
import { Community } from "../../types/intrasocial_types";
import LoadingSpinner from "../LoadingSpinner";
import { ReduxState } from "../../redux";
import { DashboardWithData } from "../../DashboardWithData";
export interface OwnProps 
{
    match:any,
}
interface ReduxStateProps 
{
    community:Community
    id:number
}
interface ReduxDispatchProps 
{
}
interface State 
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class DashboardPage extends React.Component<Props, State> 
{
    constructor(props:Props) {
        super(props);
        this.state = {
            loading:false
        }
    }
    renderLoading = () => 
    {
        if (!this.props.community) {
            return (<LoadingSpinner />)
        }
    }
    render() {
        return(
            <div id="dashboard-page" className="dashboard-container">
                {this.renderLoading()}
                <DashboardWithData category="mainmenu" />
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps:OwnProps) => {
    const activeCommunity = state.activeCommunity.activeCommunity
    const community = state.communityStore.byId[activeCommunity]
    return {
        activeCommunity,
        community
    }
}
export default connect(mapStateToProps, null)(DashboardPage);