import * as React from "react";
import SearchBar from './SearchBar';
import { EditorState } from 'draft-js';
import { SearcQueryManager } from '../../../general/input/contextsearch/extensions/index';
import { Community, ContextNaturalKey } from '../../../../types/intrasocial_types';
import { ApiClient, ListOrdering } from '../../../../network/ApiClient';
import "../SideBarItem.scss";
import LoadingSpinner from "../../../LoadingSpinner";
import ContextListItem from "./ContextListItem";
import { translate } from '../../../../localization/AutoIntlProvider';

type State = {
    isLoading: boolean
    query: string
    communities: Community[]
    title: string
}

type Props = {
    onClose:(e:React.MouseEvent) => void
}

export default class SideBarCommunityContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            isLoading: false,
            query: "",
            communities: [],
            title: translate('common.core.community')
        }
    }

    componentDidMount = () => {
        this.getCommunities();
    }

    shouldComponentUpdate = (nextProps: Props, nextState:State) => {
        const search = this.state.query != nextState.query
        const updatedCommunities = !(this.state.communities.length === nextState.communities.length && this.state.communities.sort().every(function(value, index) { return value === nextState.communities.sort()[index]}));
        const loading = this.state.isLoading != nextState.isLoading
        return search || updatedCommunities || loading
    }

    searchChanged = (es:EditorState) => {
        const searchData = SearcQueryManager.getContextSearchData(es, [])
        this.setState({query: searchData.query});
    }

    getCommunities = () => {
        this.setState({isLoading: true})
        ApiClient.getCommunities(true, ListOrdering.MOST_USED, 1000, 0, (data, status, error) => {
            if (data && data.results) {
                this.setState({communities: data.results, isLoading:false});
            }
        })
    }

    render = () => {
        var communities = this.state.communities
        if (this.state.query && this.state.query.length > 0) {
            communities = communities.filter(community => community.name.toLowerCase().includes(this.state.query.trim().toLowerCase()))
        }
        return (<>
            <div className="sidebar-content-header">
                <div className="sidebar-title">
                        {this.state.title}
                    </div>
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
                            communities.map((community) => {
                                if (community) {
                                    return <ContextListItem onClick={this.props.onClose} key={"community-" + community.id} type={ContextNaturalKey.COMMUNITY} contextObject={community}/>
                                }
                            }
                        )}
                    </div>
                </div>
            </div>
        </>)
    }
}
