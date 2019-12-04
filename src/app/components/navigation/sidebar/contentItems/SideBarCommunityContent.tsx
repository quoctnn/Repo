import * as React from "react";
import SearchBar from './SearchBar';
import { EditorState } from 'draft-js';
import { SearcQueryManager } from '../../../general/input/contextsearch/extensions/index';
import { Community, ContextNaturalKey, UserProfile } from '../../../../types/intrasocial_types';
import { ApiClient, ListOrdering } from '../../../../network/ApiClient';
import "../SideBarItem.scss";
import LoadingSpinner from "../../../LoadingSpinner";
import ContextListItem from "./ContextListItem";
import { translate } from '../../../../localization/AutoIntlProvider';
import EmptyListItem from './EmptyListItem';
import { DropDownMenu } from "../../../general/DropDownMenu";
import { OverflowMenuItem, OverflowMenuItemType } from '../../../general/OverflowMenu';
import { ContextDataProps, withContextData } from '../../../../hoc/WithContextData';
import { CommunityManager } from '../../../../managers/CommunityManager';
import { ReduxState } from "../../../../redux";
import { connect } from "react-redux";
import { AuthenticationManager } from '../../../../managers/AuthenticationManager';

type State = {
    isLoading: boolean
    query: string
    communities: Community[]
    title: string
    sorting: ListOrdering
}

type OwnProps = {
    reverse?: boolean
    onClose?:(e:React.MouseEvent) => void
}

type ReduxStateProps = {
    activeCommunity: Community,
    authenticatedUser: UserProfile
}

type Props = OwnProps & ContextDataProps & ReduxStateProps

class SideBarCommunityContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            isLoading: false,
            query: "",
            communities: [],
            title: translate('common.core.community'),
            sorting: ListOrdering.MOST_USED
        }
    }

    componentDidMount = () => {
        this.getCommunities();
    }

    componentDidUpdate = (prevProps:Props, prevState:State) => {
        if (prevState.sorting != this.state.sorting) this.getCommunities();
        const communityList = document.getElementById("communities")
        if (communityList && this.props.reverse) {
            communityList.scrollTo({top: communityList.scrollHeight})
        }
    }

    shouldComponentUpdate = (nextProps: Props, nextState:State) => {
        const search = this.state.query != nextState.query
        const updatedCommunities = !(this.state.communities.length === nextState.communities.length && this.state.communities.sort().every(function(value, index) { return value === nextState.communities.sort()[index]}));
        const newActive = this.props.activeCommunity != nextProps.activeCommunity
        const loading = this.state.isLoading != nextState.isLoading
        const sorting = this.state.sorting != nextState.sorting
        return search || updatedCommunities || newActive || loading || sorting
    }

    searchChanged = (es:EditorState) => {
        const searchData = SearcQueryManager.getContextSearchData(es, [])
        this.setState({query: searchData.query});
    }

    setSorting = (ordering: ListOrdering) => (event: React.SyntheticEvent<any>) => {
        event.stopPropagation();
        event.preventDefault();
        this.setState({sorting: ordering})
    }

    getCommunities = () => {
        this.setState({isLoading: true})
        ApiClient.getCommunities(null, this.state.sorting, 1000, 0, (data, status, error) => {
            if (data && data.results) {
                this.setState({communities: data.results, isLoading:false});
            }
        })
    }

    getSortingDropdownItems = () => {
        const sortingDropdownItems: OverflowMenuItem[] = [
            {id:"recent", title:translate("common.sorting.recent"), type:OverflowMenuItemType.option, onPress: this.setSorting(ListOrdering.RECENT)},
            {id:"mostUsed", title:translate("common.sorting.mostUsed"), type:OverflowMenuItemType.option, onPress: this.setSorting(ListOrdering.MOST_USED)},
            {id:"AtoZ", title:translate("common.sorting.AtoZ"), type:OverflowMenuItemType.option, onPress: this.setSorting(ListOrdering.ALPHABETICALLY)}
        ]
        return sortingDropdownItems
    }

    getSortingTriggerTitle = () => {
        switch(this.state.sorting) {
            case ListOrdering.ALPHABETICALLY:
                return translate("common.sorting.AtoZ")
            case ListOrdering.MOST_USED:
                return translate("common.sorting.mostUsed")
            case ListOrdering.RECENT:
                return translate("common.sorting.recent")
            default:
                return translate("Sorting")
        }
    }

    setMain = (e: React.MouseEvent) => {
        if (this.props.contextData.community) {
            ApiClient.setMainCommunity(this.props.contextData.community.id, () => {})
        }
    }

    render = () => {
        const active = this.props.activeCommunity
        const selected = this.props.contextData.community
        const canSetMain = !this.props.authenticatedUser.is_anonymous && ((!active && selected) || (selected && selected.id != active.id))
        var communities = this.state.communities
        if (this.props.reverse)
            communities = communities.reverse()
        if (this.state.query && this.state.query.length > 0) {
            communities = communities.filter(community => community.name.toLowerCase().includes(this.state.query.trim().toLowerCase()))
        }

        return (<>
            <div className="sidebar-content-header d-flex">
                <div className="sidebar-title flex-grow-1">
                    {this.state.title}
                </div>
                { canSetMain &&
                    <button className="title-button btn btn-default" onClick={this.setMain}
                            title={translate("common.core.community.set.main.description").replace("current", selected.name)}>
                        <i className="fa fa-home"></i>
                        <div className="title-button-text">{translate("common.core.community.set.main")}</div>
                    </button>
                }
            </div>
            <div className="sidebar-content-list">
                <div className="content d-flex">
                    <div className="filter-container d-flex">
                        <div className="search flex-grow-1">
                            <SearchBar onSearchQueryChange={this.searchChanged}/>
                        </div>
                        <div className="sorting">
                            <DropDownMenu className="sorting-dropdown" triggerClass="fa fa-chevron-down sorting-trigger" triggerTitle={this.getSortingTriggerTitle()} items={this.getSortingDropdownItems}></DropDownMenu>
                        </div>
                    </div>
                    <div id="communities" className="items scrollbar flex-shrink-1">
                        { this.state.isLoading &&
                            <LoadingSpinner/>
                            ||
                            communities.map((community) => {
                                if (community) {
                                    return <ContextListItem onClick={this.props.onClose} key={"community-" + community.id} type={ContextNaturalKey.COMMUNITY} contextObject={community}/>
                                }
                            }
                        )}
                        { !this.state.isLoading && communities.length == 0 &&
                            <EmptyListItem/>
                        }
                    </div>
                </div>
            </div>
        </>)
    }
}

const mapStateToProps = (state: ReduxState, ownProps: OwnProps): ReduxStateProps => {
    const activeCommunity = CommunityManager.getActiveCommunity();
    const authenticatedUser = AuthenticationManager.getAuthenticatedUser();
    return {
        activeCommunity,
        authenticatedUser
    }
}

export default withContextData(connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(SideBarCommunityContent))