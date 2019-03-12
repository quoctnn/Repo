import * as React from "react";
import { connect } from 'react-redux'
import { RootState } from '../../reducers/index';
import {  Community } from '../../types/intrasocial_types2';
import { List } from "./List";
import CommunityTreeItem from "./community/CommunityTreeItem";
require("./CommunityList.scss");

export interface OwnProps
{
}
interface ReduxStateProps
{
    communities:Community[]
}
interface ReduxDispatchProps
{
}
interface State
{
    collapsedState:boolean[],
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class CommunityList extends React.PureComponent<Props, State> {

    constructor(props) {
        super(props)
        this.state = {collapsedState:[] }
    }
    componentDidMount()
    {
        this.setState({ collapsedState:this.props.communities.map(() => true) })
    }
    componentDidUpdate(prevProps:Props)
    {
        if(this.props.communities.length != prevProps.communities.length)
        {
            this.setState({ collapsedState:this.props.communities.map(() => true)})
        }
    }
    handleClick = (index:number) => 
    {
        let collapsedState = this.state.collapsedState.map(b => b)
        collapsedState[index] = !collapsedState[index];
        this.setState({collapsedState: collapsedState });
    }
    render = () => 
    {
        return(
            <div id="community-list">
                <List>{
                this.props.communities.map( (item, index) => {
                    return (<CommunityTreeItem key={index} communityData={item} collapsed={this.state.collapsedState[index]} onClick={() => this.handleClick(index)} />)
                })
            }</List>
            </div>
        );
    }
}
const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => 
{
    return {
        communities:state.communityStore.communities,
    }
}
export default connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(CommunityList);