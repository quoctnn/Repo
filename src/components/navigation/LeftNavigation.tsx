import * as React from "react";
import CommunityTreeItem from '../general/CommunityTreeItem';
import { connect } from 'react-redux'
import { Community } from '../../reducers/communityStore';
import { RootState } from "../../reducers";
require("./LeftNavigation.scss");

export interface Props {
    communities:Community[]
}
export interface State {
    collapsedState:boolean[],
    open:boolean
}
class LeftNavigation extends React.Component<Props, {}> {
    state:State
    static leftMenuOpen = "left-menu-open"
    static defaultProps:Props = {
        communities:[],
	};
    constructor(props) {
        super(props);
        this.state = { collapsedState:[], open: false  }
        this.handleClick = this.handleClick.bind(this)
        this.updateBody = this.updateBody.bind(this)
    }
    componentWillUnmount()
    {
        document.body.classList.remove(LeftNavigation.leftMenuOpen)
    }
    componentDidMount()
    {
        this.setState({ collapsedState:this.props.communities.map(() => true) }, this.updateBody)
    }
    componentDidUpdate(prevProps:Props)
    {
        if(this.props.communities.length != prevProps.communities.length)
        {
            this.setState({ collapsedState:this.props.communities.map(() => true) , open: false }, this.updateBody)
        }
    }
    updateBody()
    {
        let open = this.state.open
        if(open)
        {
            if(!document.body.classList.contains(LeftNavigation.leftMenuOpen))
                document.body.classList.add(LeftNavigation.leftMenuOpen)
        }
        else 
        {
            if(document.body.classList.contains(LeftNavigation.leftMenuOpen))
                document.body.classList.remove(LeftNavigation.leftMenuOpen)
        }
    }
    handleClick(index:number)
    {
        let collapsedState = this.state.collapsedState
        collapsedState[index] = !collapsedState[index];
        this.setState({collapsedState: collapsedState, open: collapsedState.filter((cs) => !cs).length > 0 }, this.updateBody);
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
            <div id="left-navigation" className="flex transition">
                {this.renderData()}
            </div>
        );
    }
}
const mapStateToProps = (state:RootState) => {
    return {
        communities:state.communityStore.communities, 
    };
}
export default connect(mapStateToProps, null)(LeftNavigation);