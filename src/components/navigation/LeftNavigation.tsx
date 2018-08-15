import * as React from "react";
import ApiClient, { ListOrdering } from '../../network/ApiClient';
import { CommunityTreeItem } from '../general/CommunityTreeItem';
require("./LeftNavigation.scss");

export interface Props {
}
export interface State {
    data:any,
    limit:number,
    offset:number,
    loading:boolean,
    hasReceivedResult:boolean,
    collapsedState:boolean[]
}
export class LeftNavigation extends React.Component<Props, {}> {
    state:State
    constructor(props) {
        super(props);
        this.state = { data:null, limit:30, offset:0, loading:false, hasReceivedResult:false, collapsedState:[]  }
        this.fetchDataCallback = this.fetchDataCallback.bind(this)
        this.fetchData = this.fetchData.bind(this)
        this.handleClick = this.handleClick.bind(this)
        
    }
    componentDidMount()
    {
        this.fetchData()
    }
    fetchDataCallback(data:any, status:string, error:string)
    {
        this.setState({ data : data, hasReceivedResult:true, loading:false, collapsedState:data.results.map(() => true) })
    }
    fetchData()
    {
        if(!this.state.hasReceivedResult && !this.state.loading)

            this.setState({loading: true, offset: 0}, () => {
                ApiClient.getCommunities(true, ListOrdering.ALPHABETICAL, this.state.limit , this.state.offset, this.fetchDataCallback)
            })
    }
    handleClick(index:number)
    {
        this.state.collapsedState[index] = !this.state.collapsedState[index];
        this.setState({collapsedState: this.state.collapsedState});
    }
    renderData()
    {
        if(this.state.data)
        {
            return (<ul>{
                this.state.data.results.map( (item, index) => {
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