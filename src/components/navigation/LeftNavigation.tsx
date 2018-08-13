import * as React from "react";
import { connect } from 'react-redux'
import ApiClient, { ListOrdering } from '../../network/ApiClient';
import {injectIntl, InjectedIntlProps} from "react-intl";
import { Avatar } from '../general/Avatar';
require("./LeftNavigation.scss");

export interface Props {
    signedIn:boolean
}
export interface State {
    data:any,
    limit:number,
    offset:number,
    loading:boolean,
    hasReceivedResult:boolean
}
class LeftNavigation extends React.Component<Props, {}> {
    state:State
    constructor(props) {
        super(props);
        this.state = { data:null, limit:30, offset:0, loading:false, hasReceivedResult:false  }
        this.fetchDataCallback = this.fetchDataCallback.bind(this)
        this.fetchData = this.fetchData.bind(this)
    }
    componentDidMount()
    {
        this.fetchData()
    }
    fetchDataCallback(data:any, status:string, error:string)
    {
        this.setState({ data : data, hasReceivedResult:true, loading:false })
    }
    fetchData()
    {
        if(!this.state.hasReceivedResult && !this.state.loading)

            this.setState({loading: true, offset: 0}, () => {
                ApiClient.getCommunities(true, ListOrdering.ALPHABETICAL, this.state.limit , this.state.offset, this.fetchDataCallback)
            })
    }
    renderData()
    {
        if(this.state.data)
        {
            console.log(this.state.data)
            return (<ul>{
                this.state.data.results.map( (item, index) => {
                    return (<li key={index}><Avatar image={item.avatar} /></li>)
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
export default injectIntl(LeftNavigation);