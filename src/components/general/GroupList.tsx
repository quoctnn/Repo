import * as React from 'react';
import * as Actions from "../../actions/Actions" 
import { connect } from 'react-redux'
import {CommunityGroups } from '../../reducers/groupListCache';
import ApiClient from '../../network/ApiClient';
import LoadingSpinner from './LoadingSpinner';
import { Button } from 'reactstrap';
import { translate } from '../intl/AutoIntlProvider';
import { Link } from 'react-router-dom';
import { Routes } from '../../utilities/Routes';
import { Group } from '../../reducers/groupStore';
export interface Props {
    community_id:number,
    pageSize?:number,
    groupsData:CommunityGroups[],
    setCommunityGroups:(community:number, groups:Group[], total:number) => void,
    appendCommunityGroups:(community:number, groups:Group[]) => void,
    groupStore:Group[]
}
export interface State {
    loading:boolean,
    data:Group[],
    offset:number,
    hasLoadedData:boolean,
    cache:CommunityGroups
}
class GroupList extends React.Component<Props, {}> {
    state:State
    static defaultProps:Props = {
        community_id:null,
        pageSize:3,
        groupsData:[],
        setCommunityGroups:null,
        appendCommunityGroups:null,
        groupStore:[]
        
    }
    constructor(props) {
        super(props);
        this.state = {
            loading:false, 
            data:[],
            cache: new CommunityGroups([], this.props.community_id, 0),
            offset:0,
            hasLoadedData:false
        }
        this.responseFromServer = this.responseFromServer.bind(this)
        this.requestFromServer = this.requestFromServer.bind(this)
        this.checkUpdate = this.checkUpdate.bind(this)
        this.loadFromServer = this.loadFromServer.bind(this)
        this.renderLoadMore = this.renderLoadMore.bind(this)
    }

    componentWillMount()
    {
        this.checkUpdate()
    }
    componentDidUpdate()
    {
        this.checkUpdate()
    }
    componentDidMount()
    {
        this.requestFromServer()
    }
    checkUpdate()
    {
        if(this.props.community_id && this.props.groupsData)
        {
            let data = this.props.groupsData.find((g) => g.community_id == this.props.community_id)
            if(data && data != this.state.cache)
            {
                let result = []
                data.groups.forEach((id) => 
                {
                    let f = this.props.groupStore.find( i => i.id == id)
                    if(f)
                        result.push(f)
                })
                this.setState({data: result, cache:data, offset: data.groups.length, hasLoadedData:true})
            }
        }
    }
    responseFromServer(data:any, status:string, error:string)
    {
        this.setState({loading:false}, () => {
            if(this.state.data && this.state.data.length > 0)
                this.props.appendCommunityGroups(this.props.community_id, data.results)
            else 
                this.props.setCommunityGroups(this.props.community_id, data.results, data.count)
        })
    }
    requestFromServer()
    {
        if(!this.state.hasLoadedData)
        {
            this.setState({loading:true}, () => {

                ApiClient.getGroups(this.props.community_id, this.props.pageSize, this.state.offset, this.responseFromServer)
            })
        }
    }
    loadFromServer()
    {
        this.setState({loading:true}, () => {

            ApiClient.getGroups(this.props.community_id, this.props.pageSize, this.state.offset, this.responseFromServer)
        })
    }
    renderLoading() {
        if (this.state.loading) {
            return (<li key="loading"><LoadingSpinner/></li>)
        }
    }
    renderLoadMore()
    {
        if(this.state.loading)
            return null
        if(this.state.cache.total > this.state.data.length)
        {
            return (<li key="load-more"><Button onClick={() => this.loadFromServer()}>{translate("Load More")}</Button></li>)
        }
        else if(this.state.data.length == 0)
        {
            return (<li>+ NO GROUPS AVAILABLE</li>)
        }
    }
    render()
    {
        let groups = this.state.data || []
        return (<ul className="group-list">
                    {groups.map((g, index) => {
                        return (<li className="text-truncate" key={index}>
                            <Link to={Routes.COMMUNITY + g.community + "/" + g.slug}>{g.name}</Link>
                            </li>)
                    }) }
                    {this.renderLoadMore()}
                    {this.renderLoading()}
                </ul>)
    }
}

const mapStateToProps = (state) => {
    return {
        groupsData: state.groupListCache.groups,
        groupStore:state.groupStore.groups
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        setCommunityGroups:(community:number, groups:Group[], total:number) => {
            dispatch(Actions.setCommunityGroupsCache(community, groups.map(g => g.id), total))
            dispatch(Actions.storeGroups(groups))
        },
        appendCommunityGroups:(community:number, groups:Group[]) => {
            dispatch(Actions.appendCommunityGroupsCache(community, groups.map(g => g.id)))
            dispatch(Actions.storeGroups(groups))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(GroupList);