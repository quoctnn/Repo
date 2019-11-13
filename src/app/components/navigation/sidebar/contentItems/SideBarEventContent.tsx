import * as React from "react";
import SearchBar from './SearchBar';
import { EditorState } from 'draft-js';
import { SearcQueryManager } from '../../../general/input/contextsearch/extensions/index';
import { Community, Event, ContextNaturalKey, ContextObject } from '../../../../types/intrasocial_types';
import { ApiClient } from '../../../../network/ApiClient';
import "../SideBarItem.scss";
import LoadingSpinner from "../../../LoadingSpinner";
import ContextListItem from "./ContextListItem";
import { ContextDataProps, withContextData } from '../../../../hoc/WithContextData';
import { connect } from 'react-redux';
import { CommunityManager } from '../../../../managers/CommunityManager';
import { ReduxState } from "../../../../redux";
import { translate } from '../../../../localization/AutoIntlProvider';
import { EventSorting } from '../../../../modules/events/EventsMenu';

type State = {
    isLoading: boolean
    query: string
    events: Event[]
    parent: Event
    title: string
    subtitle: string
}

type OwnProps = {
    onClose:(e:React.MouseEvent) => void
}

type ReduxStateProps = {
    activeCommunity:Community
}

type Props = OwnProps & ContextDataProps & ReduxStateProps

class SideBarEventContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            isLoading: false,
            query: "",
            events: [],
            parent: null,
            title: translate('common.event.events'),
            subtitle: ""
        }
    }

    componentDidMount = () => {
        this.setState({isLoading: true})
        this.getEvents();
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        if (this.props.contextData.community != prevProps.contextData.community) {
            this.setState({isLoading: true})
            this.getEvents()
        }
        if (this.state.parent != prevState.parent) {
            this.getEvents()
        }
    }
    shouldComponentUpdate = (nextProps: Props, nextState:State) => {
        const search = this.state.query != nextState.query
        const updatedEvents = !(this.state.events.length === nextState.events.length && this.state.events.sort().every(function(value, index) { return value === nextState.events.sort()[index]}));
        const loading = this.state.isLoading != nextState.isLoading
        const updatedCommunity = this.props.contextData.community != nextProps.contextData.community
        const updatedEvent = this.props.contextData.event != nextProps.contextData.event
        const updatedParent = this.state.parent != nextState.parent
        return search || updatedEvents || loading || updatedCommunity || updatedEvent || updatedParent
    }

    searchChanged = (es:EditorState) => {
        const searchData = SearcQueryManager.getContextSearchData(es, [])
        this.setState({query: searchData.query});
    }

    getEvents = () => {
        const community = this.props.contextData.community || this.props.activeCommunity
        if (community) {
            ApiClient.getEvents(community.id, this.state.parent && this.state.parent.id, null, 1000, 0, EventSorting.date, true, (data, status, error) => {
                if (data && data.results && data.results.length > 0) {
                    const title = this.state.parent ? this.state.parent.name : translate('common.event.events')
                    this.setState({events: data.results, isLoading:false, title: title});
                } else if (this.state.parent) {
                    this.goBack()
                } else {
                    this.setState({isLoading:false});
                }
            })
        }
    }

    setParent = (event: ContextObject) => {
        this.setState({parent: event as Event});
    }

    goBack = (e?: React.MouseEvent) => {
        this.setState({isLoading: true})
        if (this.state.parent) {
            if (this.state.parent.parent) {
                ApiClient.getEvent(this.state.parent.parent.toString(), (data, status, error) => {
                    if (data) {
                        this.setState({parent: data, title: data.name});
                    } else {
                        this.setState({parent: null, title: translate('common.event.events')});
                    }
                })
            } else {
                this.setState({parent: null, title: translate('common.event.events')})
            }
        }
    }

    createNew = (e?: React.MouseEvent) => {
    }

    render = () => {
        var events = this.state.events
        if (this.state.query && this.state.query.length > 0) {
            events = events.filter(events => events.name.toLowerCase().includes(this.state.query.trim().toLowerCase()))
        }
        return (<>
            <div className="sidebar-content-header d-flex">
                { this.state.parent &&
                    <><button className="title-button btn btn-default" onClick={this.goBack}><i className="fa fa-chevron-left"></i></button>
                    <div className="sidebar-breadcrumb flex-grow-1">
                        {this.state.title}
                    </div></>
                    ||
                    <div className="sidebar-title flex-grow-1">
                        {this.state.title}
                    </div>
                }
                { true &&
                    <button className="title-button btn btn-default" onClick={this.createNew}><i className="fa fa-plus"></i></button>
                }
                { this.state.subtitle &&
                    <div className="sidebar-subtitle">
                        {this.state.subtitle}
                    </div>
                }
            </div>
            <div className="sidebar-content-list">
                <div className="content d-flex flex-column">
                    <div className="search">
                        <SearchBar onSearchQueryChange={this.searchChanged}/>
                    </div>
                    <div className="items scrollbar flex-shrink-1">
                        { this.state.isLoading &&
                            <LoadingSpinner/>
                            ||
                            events.map((event) => {
                                if (event) {
                                    return <ContextListItem onClick={this.props.onClose} setParent={this.setParent} key={"event-" + event.id} type={ContextNaturalKey.EVENT} contextObject={event}/>
                                }
                            }
                        )}
                        { !this.state.isLoading && events.length == 0 &&
                            <div>{translate("search.result.empty")}</div>
                        }
                    </div>
                </div>
            </div>
        </>)
    }
}

const mapStateToProps = (state: ReduxState, ownProps: OwnProps): ReduxStateProps => {

    const activeCommunity = CommunityManager.getActiveCommunity();
    return {
        activeCommunity
    }
}

export default withContextData(connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(SideBarEventContent))