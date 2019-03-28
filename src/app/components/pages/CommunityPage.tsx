import * as React from "react";
import { connect } from 'react-redux'
import "./CommunityPage.scss"
import { Community } from "../../types/intrasocial_types";
import { CommunityManager } from "../../managers/CommunityManager";
import LoadingSpinner from "../LoadingSpinner";
import { ReduxState } from "../../redux";
import PageHeader from "../PageHeader";
import PageTopNavigation from "../PageTopNavigation";
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
class CommunityPage extends React.Component<Props, State> 
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
            return (<LoadingSpinner />)
        }
    }
    renderCommunity(community:Community)
    {
        return (
            <div className="content">
                <PageHeader community={community}>
                    <PageTopNavigation community={community}/>
                </PageHeader>
            </div>)
    }
    render() {
        const community = this.props.community
        return(
            <div id="community-page" className="">
                {this.renderLoading()}
                {community && this.renderCommunity(community)}
                {!community && <div>NO COMMUNITY</div>}
            </div>
        );
    }
}
const mapStateToProps = (state:ReduxState, ownProps:OwnProps) => {
    const communityid:string = ownProps.match.params.communityname
    const community = CommunityManager.getCommunity(communityid)
    return {
        community,
        id:communityid
    }
}
export default connect(mapStateToProps, null)(CommunityPage);