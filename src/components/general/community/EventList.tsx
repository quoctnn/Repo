import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import * as Actions from "../../../actions/Actions";
import ApiClient from '../../../network/ApiClient';
import { RootState } from '../../../reducers';
import { CommunityEvents } from '../../../reducers/eventListCache';
import { Event } from '../../../types/intrasocial_types';
import { Routes } from '../../../utilities/Routes';
import { translate } from '../../intl/AutoIntlProvider';
import LoadingSpinner from '../LoadingSpinner';
export interface Props {
    community_id:number,
    pageSize?:number,
    eventsData:CommunityEvents[],
    setCommunityEvents:(community:number, events:Event[], total:number) => void,
    appendCommunityEvents:(community:number, events:Event[]) => void,
    eventStore:Event[]
}
export interface State {
    loading:boolean,
    data:Event[],
    offset:number,
    hasLoadedData:boolean,
    cache:CommunityEvents
}
class EventList extends React.Component<Props, {}> {
    state:State
    static defaultProps:Props = {
        community_id:null,
        pageSize:3,
        eventsData:[],
        setCommunityEvents:null,
        appendCommunityEvents:null,
        eventStore:[]

    }
    constructor(props) {
        super(props);
        this.state = {
            loading:false,
            data:[],
            cache: new CommunityEvents([], this.props.community_id, 0),
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
        if(this.props.community_id && this.props.eventsData)
        {
            let data = this.props.eventsData.find((g) => g.community_id == this.props.community_id)
            if(data && data != this.state.cache)
            {
                let result = []
                data.events.forEach((id) =>
                {
                    let f = this.props.eventStore.find( i => i.id == id)
                    if(f)
                        result.push(f)
                })
                this.setState({data: result, cache:data, offset: data.events.length, hasLoadedData:true})
            }
        }
    }
    responseFromServer(data:any, status:string, error:string)
    {
        this.setState({loading:false}, () => {
            if(this.state.data && this.state.data.length > 0)
                this.props.appendCommunityEvents(this.props.community_id, data.results)
            else
                this.props.setCommunityEvents(this.props.community_id, data.results, data.count)
        })
    }
    requestFromServer()
    {
        if(!this.state.hasLoadedData)
        {
            this.setState({loading:true}, () => {

                ApiClient.getEvents(this.props.community_id, this.props.pageSize, this.state.offset, this.responseFromServer)
            })
        }
    }
    loadFromServer()
    {
        this.setState({loading:true}, () => {

            ApiClient.getEvents(this.props.community_id, this.props.pageSize, this.state.offset, this.responseFromServer)
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
            return (<li>+ NO EVENTS AVAILABLE</li>)
        }
    }
    render()
    {
        let events = this.state.data || []
        return (<ul className="event-list">
                    {events.map((g, index) => {
                        return (<li className="text-truncate" key={index}>
                            <Link to={Routes.COMMUNITY + g.community + "/event/" + g.slug}>{g.name}</Link>
                            </li>)
                    }) }
                    {this.renderLoadMore()}
                    {this.renderLoading()}
                </ul>)
    }
}

const mapStateToProps = (state:RootState) => {
    return {
        eventsData: state.eventListCache.events,
        eventStore:state.eventStore.events
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        setCommunityEvents:(community:number, events:Event[], total:number) => {
            dispatch(Actions.setCommunityEventsCache(community, events.map(g => g.id), total))
            dispatch(Actions.storeEvents(events))
        },
        appendCommunityEvents:(community:number, events:Event[]) => {
            dispatch(Actions.appendCommunityEventsCache(community, events.map(g => g.id)))
            dispatch(Actions.storeEvents(events))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(EventList);