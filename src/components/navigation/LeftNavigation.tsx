import * as React from "react";
import ApiClient, { ListOrdering } from '../../network/ApiClient';
import { CommunityTreeItem } from '../general/CommunityTreeItem';
import { connect } from 'react-redux'
import { Community } from '../../reducers/communities';
require("./LeftNavigation.scss");

export interface Props {
    communities:Community[]
}
export interface State {
    collapsedState:boolean[]
}
class LeftNavigation extends React.Component<Props, {}> {
    state:State
    constructor(props) {
        super(props);
        this.state = { collapsedState:[]  }
        this.handleClick = this.handleClick.bind(this)
    }
    handleClick(index:number)
    {
        this.state.collapsedState[index] = !this.state.collapsedState[index];
        this.setState({collapsedState: this.state.collapsedState});
    }
    renderData()
    {
        if(this.props.communities)
        {
            return (<ul>{
                this.props.communities.map( (item, index) => {
                    return (<li key={index}><CommunityTreeItem communityData={item} collapsed={this.state.collapsedState[index]} onClick={this.handleClick.bind(null, index)} /></li>)
                })
            }</ul>)
        }
        return null
    }
    render() {
        return(
            <div id="left-navigation" className="flex">
                {this.renderData()}
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        communities:state.communities.communitiesArray, 
    };
}
export default connect(mapStateToProps, null)(LeftNavigation);