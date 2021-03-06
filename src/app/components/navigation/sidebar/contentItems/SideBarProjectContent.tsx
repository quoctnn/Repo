import * as React from "react";
import SearchBar from './SearchBar';
import { EditorState } from 'draft-js';
import { SearcQueryManager } from '../../../general/input/contextsearch/extensions/index';
import { Community, Project, ContextNaturalKey, ProjectSorting, Permission } from '../../../../types/intrasocial_types';
import { ApiClient } from '../../../../network/ApiClient';
import "../SideBarItem.scss";
import LoadingSpinner from "../../../LoadingSpinner";
import ContextListItem from "./ContextListItem";
import { ContextDataProps, withContextData } from '../../../../hoc/WithContextData';
import { connect } from 'react-redux';
import { CommunityManager } from '../../../../managers/CommunityManager';
import { ReduxState } from "../../../../redux";
import { translate } from '../../../../localization/AutoIntlProvider';
import EmptyListItem from './EmptyListItem';
import { OverflowMenuItem, OverflowMenuItemType } from "../../../general/OverflowMenu";
import { DropDownMenu } from "../../../general/DropDownMenu";

type State = {
    isLoading: boolean
    query: string
    projects: Project[]
    title: string
    subtitle: string,
    sorting: ProjectSorting
}

type OwnProps = {
    reverse?: boolean
    onClose?:(e:React.MouseEvent) => void
    onCreate:(e:React.MouseEvent) => void
}

type ReduxStateProps = {
    activeCommunity:Community
}

type Props = OwnProps & ContextDataProps & ReduxStateProps

class SideBarProjectContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            isLoading: false,
            query: "",
            projects: [],
            title: translate('common.project.projects'),
            subtitle: "",
            sorting: ProjectSorting.mostUsed
        }
    }

    componentDidMount = () => {
        this.setState({isLoading: true})
        this.getProjects();
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        if (this.props.contextData.community != prevProps.contextData.community ||
            this.state.sorting != prevState.sorting) {
            this.setState({isLoading: true})
            this.getProjects()
        }
        const projectList = document.getElementById("projects")
        if (projectList && this.props.reverse) {
            projectList.scrollTo({top: projectList.scrollHeight})
        }
    }
    shouldComponentUpdate = (nextProps: Props, nextState:State) => {
        const search = this.state.query != nextState.query
        const updatedProjects = !(this.state.projects.length === nextState.projects.length && this.state.projects.sort().every(function(value, index) { return value === nextState.projects.sort()[index]}));
        const loading = this.state.isLoading != nextState.isLoading
        const updatedCommunity = this.props.contextData.community != nextProps.contextData.community
        const updatedProject = this.props.contextData.project != nextProps.contextData.project
        const updatedSorting = this.state.sorting != nextState.sorting
        return search || updatedProjects || loading || updatedCommunity || updatedProject || updatedSorting
    }

    searchChanged = (es:EditorState) => {
        const searchData = SearcQueryManager.getContextSearchData(es, [])
        this.setState({query: searchData.query});
    }

    setSorting = (ordering: ProjectSorting) => (event: React.SyntheticEvent<any>) => {
        event.stopPropagation();
        event.preventDefault();
        this.setState({sorting: ordering})
    }

    getProjects = () => {
        const community = this.props.contextData.community || this.props.activeCommunity
        if (community) {
            ApiClient.getProjects(community.id, null, 1000, 0, this.state.sorting, false, false, (data, status, error) => {
                if (data && data.results && data.results.length > 0) {
                    this.setState({projects: data.results, isLoading:false});
                } else {
                    this.setState({isLoading:false});
                }
            })
        }
    }

    getSortingDropdownItems = () => {
        const sortingDropdownItems: OverflowMenuItem[] = [
            {id:"recent", title:ProjectSorting.translatedText(ProjectSorting.recent), type:OverflowMenuItemType.option, onPress: this.setSorting(ProjectSorting.recent)},
            {id:"mostUsed", title:ProjectSorting.translatedText(ProjectSorting.mostUsed), type:OverflowMenuItemType.option, onPress: this.setSorting(ProjectSorting.mostUsed)},
            {id:"AtoZ", title:ProjectSorting.translatedText(ProjectSorting.AtoZ), type:OverflowMenuItemType.option, onPress: this.setSorting(ProjectSorting.AtoZ)}
        ]
        return sortingDropdownItems
    }

    render = () => {
        var projects = this.state.projects
        if (this.props.reverse)
            projects = projects.reverse()
        if (this.state.query && this.state.query.length > 0) {
            projects = projects.filter(projects => projects.name.toLowerCase().includes(this.state.query.trim().toLowerCase()))
        }
        return (<>
            <div className="sidebar-content-header d-flex">
                <div className="sidebar-title flex-grow-1">
                    {this.state.title}
                </div>
                { this.props.contextData.community && this.props.contextData.community.project_creation_permission >= Permission.limited_write &&
                    <button className="title-button btn btn-default" onClick={this.props.onCreate}><i className="fa fa-plus"></i></button>
                }
                { this.state.subtitle &&
                    <div className="sidebar-subtitle">
                        {this.state.subtitle}
                    </div>
                }
            </div>
            <div className="sidebar-content-list">
                <div className="content d-flex">
                    <div className="filter-container d-flex">
                        <div className="search flex-grow-1">
                            <SearchBar onSearchQueryChange={this.searchChanged}/>
                        </div>
                        <div className="sorting">
                            <DropDownMenu className="sorting-dropdown" triggerClass="fa fa-chevron-down sorting-trigger" triggerTitle={ProjectSorting.translatedText(this.state.sorting)} items={this.getSortingDropdownItems}></DropDownMenu>
                        </div>
                    </div>
                    <div id="projects" className="items scrollbar flex-shrink-1">
                        { this.state.isLoading &&
                            <LoadingSpinner/>
                            ||
                            projects.map((project) => {
                                if (project) {
                                    return <ContextListItem onClick={this.props.onClose} key={"project-" + project.id} type={ContextNaturalKey.PROJECT} contextObject={project}/>
                                }
                            }
                        )}
                        { !this.state.isLoading && projects.length == 0 &&
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
    return {
        activeCommunity
    }
}

export default withContextData(connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(SideBarProjectContent))