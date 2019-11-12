import * as React from "react";
import classnames from 'classnames';
import SearchBar from './SearchBar';
import { EditorState } from 'draft-js';
import { SearcQueryManager } from '../../../general/input/contextsearch/extensions/index';
import { ReduxState } from "../../../../redux";
import { Community } from '../../../../types/intrasocial_types';
import { connect } from 'react-redux';
import { CommunityManager } from '../../../../managers/CommunityManager';
import { ApiClient, ListOrdering } from '../../../../network/ApiClient';
import Avatar from '../../../general/Avatar';
import "./SideBarCommunityItem.scss";
import { withContextData, ContextDataProps } from '../../../../hoc/WithContextData';
import { Link } from 'react-router-dom';
import LoadingSpinner from "../../../LoadingSpinner";

type State = {
    isLoading: boolean
    query: string
    communities: Community[]
}

type OwnProps = {
}

type ReduxStateProps = {
    activeCommunity:Community
}

type Props = OwnProps & ContextDataProps & ReduxStateProps

class SideBarCommunityContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            isLoading: false,
            query: "",
            communities: []
        }
    }

    componentDidMount = () => {
        this.getCommunities();
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
    }

    shouldComponentUpdate = (nextProps: Props, nextState:State) => {
        const newCommunity = (this.props.contextData.community && nextProps.contextData.community && this.props.contextData.community.id != nextProps.contextData.community.id) || (nextProps.contextData.community && !this.props.contextData.community) || (this.props.contextData.community && !nextProps.contextData.community)
        const search = this.state.query != nextState.query
        const updatedCommunities = this.state.communities.length != nextState.communities.length
        const changedActive = this.props.activeCommunity != nextProps.activeCommunity
        const loading = this.state.isLoading != nextState.isLoading
        return search || updatedCommunities || changedActive || newCommunity || loading
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
        return (<div className="community-content d-flex flex-column">
            <div className="search">
                <SearchBar onSearchQueryChange={this.searchChanged}/>
            </div>
            <div className="community-items scrollbar flex-shrink-1">
                { this.state.isLoading &&
                  <LoadingSpinner/>
                 ||
                 communities.map((community) => {
                    if (community) {
                        const isMain = this.props.activeCommunity && this.props.activeCommunity.id == community.id
                        const isActive = this.props.contextData.community && this.props.contextData.community.id == community.id
                        const cn = classnames("d-flex list-item", {"active": isActive})
                        return (
                            <Link className={cn} to={community.uri} key={community.id}>
                                <div className="community-icon">
                                    {isMain &&
                                        <i className="fa fa-home"/>
                                        ||
                                        <i className="fa fa-globe"/>
                                    }
                                </div>
                                <div className="community-name text-truncate flex-grow-1">{community.name}</div>
                                <div className="community-avatar">
                                    <Avatar image={community.avatar_thumbnail} size={18} />
                                </div>
                            </Link>
                            )
                    }
                })}
            </div>
        </div>)
    }
}

const mapStateToProps = (state: ReduxState, ownProps: OwnProps): ReduxStateProps => {

    const activeCommunity = CommunityManager.getActiveCommunity();
    return {
        activeCommunity
    }
}
export default withContextData(connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(SideBarCommunityContent))