import * as React from "react";
import { connect } from 'react-redux'
import { CoverImage } from '../../components/general/CoverImage';
import { RootState } from "../../reducers";
import { Group } from "../../types/intrasocial_types2";
import { GroupManager } from "../../managers/GroupManager";
import LoadingSpinner from "../../components/general/LoadingSpinner";
require("./GroupView.scss");
export interface OwnProps 
{
    match:any,
}
interface ReduxStateProps 
{
    group:Group|null
    id:string
}
interface ReduxDispatchProps 
{
}
interface State 
{
    loading:boolean
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps

class GroupView extends React.Component<Props, State> 
{
    constructor(props) {
        super(props);
        this.state = {
            loading:false
        }
    }
    componentDidMount = () => {
        if(!this.props.group)
        {
            this.setState({loading:true}, () => {
                GroupManager.ensureGroupExists(this.props.id, () => {
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
    renderGroup(group:Group)
    {
        return (
        <div className="content">
            <CoverImage src={group.cover || group.cover_cropped}>
                <div className="down-shadow profile-name text-truncate">
                    <h2 className="text-truncate">{group.name}</h2>
                </div>
            </CoverImage> 
        </div>)
    }
    render() {
        const group = this.props.group
        return(
            <div id="group-view" className="col-sm">
                {this.renderLoading()}
                {group && this.renderGroup(group)}
                {!group && <div>NO GROUP</div>}
            </div>
        );
    }
}
const mapStateToProps = (state:RootState, ownProps:OwnProps) => {
    const groupid:string = ownProps.match.params.groupname
    const group = GroupManager.getGroup(groupid)
    return {
        group,
        id:groupid
    }
}
export default connect(mapStateToProps, null)(GroupView);