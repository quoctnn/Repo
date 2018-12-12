import * as React from "react";
import { connect } from 'react-redux'
import { RootState } from "../../reducers";
import { Community } from "../../types/intrasocial_types";
import { CommunityManager } from "../../managers/CommunityManager";
import LoadingSpinner from "../../components/general/LoadingSpinner";
require("./CommunityView.scss");
export interface OwnProps 
{
    match:any,
}
interface ReduxStateProps 
{
    community:Community|null
    id:number
}
interface ReduxDispatchProps 
{
}
interface State 
{
    loading:boolean
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class CommunityView extends React.Component<Props, State> 
{
    constructor(props) {
        super(props);
        this.state = {
            loading:false
        }
    }
    componentDidMount = () => {
        if(!this.props.community)
        {
            this.setState({loading:true}, () => {
                CommunityManager.ensureCommunityExists(this.props.id, () => {
                    this.setState({loading:false})
                })
            })
        }
    }
    renderLoading = () => 
    {
        if (this.state.loading) {
            return (<LoadingSpinner/>)
        }
    }
    renderCommunity(community:Community)
    {
        return (
            <div className="content">
                <h2 className="text-truncate">{community.name}</h2>
            </div>)
    }
    render() {
        const community = this.props.community
        return(
            <div id="task-view" className="col-sm">
                {this.renderLoading()}
                {community && this.renderCommunity(community)}
                {!community && <div>NO COMMUNITY</div>}
            </div>
        );
    }
}
const mapStateToProps = (state:RootState, ownProps:OwnProps) => {
    const communityid:string = ownProps.match.params.communityname
    const community = CommunityManager.getCommunity(communityid)
    return {
        community,
        id:communityid
    }
}
export default connect(mapStateToProps, null)(CommunityView);