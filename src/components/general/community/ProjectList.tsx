import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import * as Actions from "../../../actions/Actions";
import ApiClient, { ApiClientFeedPageCallback } from '../../../network/ApiClient';
import { RootState } from '../../../reducers';
import { CommunityProjects } from '../../../reducers/projectListCache';
import { Project } from '../../../types/intrasocial_types';
import Routes from '../../../utilities/Routes';
import { translate } from '../../intl/AutoIntlProvider';
import LoadingSpinner from '../LoadingSpinner';
import { ToastManager } from '../../../managers/ToastManager';
export interface Props {
    community_id:number,
    pageSize?:number,
    projectsData:CommunityProjects[],
    setCommunityProjects:(community:number, projects:Project[], total:number) => void,
    appendCommunityProjects:(community:number, projects:Project[]) => void,
    projectStore:Project[]
}
export interface State {
    loading:boolean,
    data:Project[],
    offset:number,
    hasLoadedData:boolean,
    cache:CommunityProjects
}
class ProjectList extends React.Component<Props, {}> {
    state:State
    static defaultProps:Props = {
        community_id:null,
        pageSize:3,
        projectsData:[],
        setCommunityProjects:null,
        appendCommunityProjects:null,
        projectStore:[]

    }
    constructor(props) {
        super(props);
        this.state = {
            loading:false,
            data:[],
            cache: new CommunityProjects([], this.props.community_id, 0),
            offset:0,
            hasLoadedData:false
        }
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
        if(this.props.community_id && this.props.projectsData)
        {
            let data = this.props.projectsData.find((g) => g.community_id == this.props.community_id)
            if(data && data != this.state.cache)
            {
                let result = []
                data.projects.forEach((id) =>
                {
                    let f = this.props.projectStore.find( i => i.id == id)
                    if(f)
                        result.push(f)
                })
                this.setState({data: result, cache:data, offset: data.projects.length, hasLoadedData:true})
            }
        }
    }
    responseFromServer:ApiClientFeedPageCallback<Project> = (data, status, error) => 
    {
        this.setState({loading:false}, () => {
            if (data.results)
            {
                if(this.state.data && this.state.data.length > 0)
                    this.props.appendCommunityProjects(this.props.community_id, data.results)
                else
                    this.props.setCommunityProjects(this.props.community_id, data.results, data.count)
            }
            else 
            {
                ToastManager.showErrorToast(`Request error:${status}${error}`)
            }
        })
        
    }
    requestFromServer()
    {
        if(!this.state.hasLoadedData)
        {
            this.setState({loading:true}, () => {

                ApiClient.getProjects(this.props.community_id, this.props.pageSize, this.state.offset, this.responseFromServer)
            })
        }
    }
    loadFromServer()
    {
        this.setState({loading:true}, () => {

            ApiClient.getProjects(this.props.community_id, this.props.pageSize, this.state.offset, this.responseFromServer)
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
            return (<li className="text-truncate content">+ NO PROJECTS AVAILABLE</li>)
        }
    }
    render()
    {
        let projects = this.state.data || []
        return (<ul className="project-list">
                    {projects.map((g, index) => {
                        return (<li className="text-truncate" key={index}>
                            <Link className="text-truncate content" to={Routes.projectUrl(g.community,g.slug)}>{g.name}</Link>
                            </li>)
                    }) }
                    {this.renderLoadMore()}
                    {this.renderLoading()}
                </ul>)
    }
}

const mapStateToProps = (state:RootState) => {
    return {
        projectsData: state.projectListCache.projects,
        projectStore:state.projectStore.projects
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        setCommunityProjects:(community:number, projects:Project[], total:number) => {
            dispatch(Actions.setCommunityProjectsCache(community, projects.map(g => g.id), total))
            dispatch(Actions.storeProjects(projects))
        },
        appendCommunityProjects:(community:number, projects:Project[]) => {
            dispatch(Actions.appendCommunityProjectsCache(community, projects.map(g => g.id)))
            dispatch(Actions.storeProjects(projects))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);