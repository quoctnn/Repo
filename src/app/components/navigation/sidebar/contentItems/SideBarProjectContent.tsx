import * as React from "react";
import SearchBar from './SearchBar';
import { EditorState } from 'draft-js';
import { SearcQueryManager } from '../../../general/input/contextsearch/extensions/index';
import { Community, Project, ContextNaturalKey, ContextObject, ProjectSorting } from '../../../../types/intrasocial_types';
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
    projects: Project[]
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

class SideBarProjectContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            isLoading: false,
            query: "",
            projects: [],
            title: translate('common.project.projects'),
            subtitle: ""
        }
    }

    componentDidMount = () => {
        this.setState({isLoading: true})
        this.getProjects();
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        if (this.props.contextData.community != prevProps.contextData.community) {
            this.setState({isLoading: true})
            this.getProjects()
        }
    }
    shouldComponentUpdate = (nextProps: Props, nextState:State) => {
        const search = this.state.query != nextState.query
        const updatedProjects = !(this.state.projects.length === nextState.projects.length && this.state.projects.sort().every(function(value, index) { return value === nextState.projects.sort()[index]}));
        const loading = this.state.isLoading != nextState.isLoading
        const updatedCommunity = this.props.contextData.community != nextProps.contextData.community
        const updatedProject = this.props.contextData.project != nextProps.contextData.project
        return search || updatedProjects || loading || updatedCommunity || updatedProject
    }

    searchChanged = (es:EditorState) => {
        const searchData = SearcQueryManager.getContextSearchData(es, [])
        this.setState({query: searchData.query});
    }

    getProjects = () => {
        const community = this.props.contextData.community || this.props.activeCommunity
        if (community) {
            ApiClient.getProjects(community.id, null, 1000, 0, ProjectSorting.mostUsed, false, false, (data, status, error) => {
                if (data && data.results && data.results.length > 0) {
                    this.setState({projects: data.results, isLoading:false});
                } else {
                    this.setState({isLoading:false});
                }
            })
        }
    }

    createNew = (e?: React.MouseEvent) => {
    }

    render = () => {
        var projects = this.state.projects
        if (this.state.query && this.state.query.length > 0) {
            projects = projects.filter(projects => projects.name.toLowerCase().includes(this.state.query.trim().toLowerCase()))
        }
        return (<>
            <div className="sidebar-content-header d-flex">
                <div className="sidebar-title flex-grow-1">
                    {this.state.title}
                </div>
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
                            projects.map((project) => {
                                if (project) {
                                    return <ContextListItem onClick={this.props.onClose} key={"project-" + project.id} type={ContextNaturalKey.PROJECT} contextObject={project}/>
                                }
                            }
                        )}
                        { !this.state.isLoading && projects.length == 0 &&
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

export default withContextData(connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(SideBarProjectContent))