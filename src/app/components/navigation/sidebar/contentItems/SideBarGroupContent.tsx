import * as React from "react";
import SearchBar from './SearchBar';
import { EditorState } from 'draft-js';
import { SearcQueryManager } from '../../../general/input/contextsearch/extensions/index';
import { Community, GroupSorting, Group, ContextNaturalKey, ContextObject } from '../../../../types/intrasocial_types';
import { ApiClient } from '../../../../network/ApiClient';
import "../SideBarItem.scss";
import LoadingSpinner from "../../../LoadingSpinner";
import ContextListItem from "./ContextListItem";
import { ContextDataProps, withContextData } from '../../../../hoc/WithContextData';
import { connect } from 'react-redux';
import { CommunityManager } from '../../../../managers/CommunityManager';
import { ReduxState } from "../../../../redux";
import { translate } from '../../../../localization/AutoIntlProvider';

type State = {
    isLoading: boolean
    query: string
    groups: Group[]
    parent: Group
    title: string
    subtitle: string
}

type OwnProps = {
}

type ReduxStateProps = {
    activeCommunity:Community
}

type Props = ContextDataProps & ReduxStateProps

class SideBarGroupContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            isLoading: false,
            query: "",
            groups: [],
            parent: null,
            title: translate('common.group.groups'),
            subtitle: ""
        }
    }

    componentDidMount = () => {
        this.setState({isLoading: true})
        this.getGroups();
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        if (this.props.contextData.community != prevProps.contextData.community) {
            this.setState({isLoading: true})
            this.getGroups()
        }
        if (this.state.parent != prevState.parent) {
            this.getGroups()
        }
    }
    shouldComponentUpdate = (nextProps: Props, nextState:State) => {
        const search = this.state.query != nextState.query
        const updatedGroups = this.state.groups.length != nextState.groups.length
        const loading = this.state.isLoading != nextState.isLoading
        const updatedCommunity = this.props.contextData.community != nextProps.contextData.community
        const updatedGroup = this.props.contextData.group != nextProps.contextData.group
        const updatedParent = this.state.parent != nextState.parent
        return search || updatedGroups || loading || updatedCommunity || updatedGroup || updatedParent
    }

    searchChanged = (es:EditorState) => {
        const searchData = SearcQueryManager.getContextSearchData(es, [])
        this.setState({query: searchData.query});
    }

    getGroups = () => {
        const community = this.props.contextData.community || this.props.activeCommunity
        if (community) {
            ApiClient.getGroups(community.id, this.state.parent && this.state.parent.id, 1000, 0, GroupSorting.mostUsed, (data, status, error) => {
                if (data && data.results && data.results.length > 0) {
                    const title = this.state.parent ? this.state.parent.name : translate('common.group.groups')
                    this.setState({groups: data.results, isLoading:false, title: title});
                } else if (this.state.parent) {
                    this.goBack()
                } else {
                    this.setState({isLoading:false});
                }
            })
        }
    }

    setParent = (group: ContextObject) => {
        this.setState({parent: group as Group});
    }

    goBack = (e?: React.MouseEvent) => {
        this.setState({isLoading: true})
        if (this.state.parent) {
            if (this.state.parent.parent) {
                ApiClient.getGroup(this.state.parent.parent.toString(), (data, status, error) => {
                    if (data) {
                        this.setState({parent: data, title: data.name});
                    } else {
                        this.setState({parent: null, title: translate('common.group.groups')});
                    }
                })
            } else {
                this.setState({parent: null, title: translate('common.group.groups')})
            }
        }
    }

    createNew = (e?: React.MouseEvent) => {
    }

    render = () => {
        var groups = this.state.groups
        if (this.state.query && this.state.query.length > 0) {
            groups = groups.filter(groups => groups.name.toLowerCase().includes(this.state.query.trim().toLowerCase()))
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
                            groups.map((group) => {
                                if (group) {
                                    return <ContextListItem setParent={this.setParent} key={"group-" + group.id} type={ContextNaturalKey.GROUP} contextObject={group}/>
                                }
                            }
                        )}
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

export default withContextData(connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(SideBarGroupContent))