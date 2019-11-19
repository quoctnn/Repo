import * as React from "react";
import { Community, ContextNaturalKey, UploadedFile } from '../../../../types/intrasocial_types';
import { ApiClient } from '../../../../network/ApiClient';
import "../SideBarItem.scss";
import LoadingSpinner from "../../../LoadingSpinner";
import { translate } from '../../../../localization/AutoIntlProvider';
import { ReduxState } from "../../../../redux";
import { CommunityManager } from "../../../../managers/CommunityManager";
import { withContextData, ContextDataProps } from '../../../../hoc/WithContextData';
import { connect } from "react-redux";
import FileListItem from '../../../../modules/files/FileListItem';
import { EditorState } from "draft-js";
import { SearcQueryManager } from "../../../general/input/contextsearch/extensions";
import SearchBar from './SearchBar';
import EmptyListItem from './EmptyListItem';

type State = {
    isLoading: boolean
    query: string
    title: string
    subtitle: string
    files: UploadedFile[]

}

type OwnProps = {
    onClose: (e: React.MouseEvent) => void
}

type ReduxStateProps = {
    activeCommunity: Community
}

type Props = OwnProps & ContextDataProps & ReduxStateProps

class SideBarFilesContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            isLoading: false,
            query: "",
            title: translate('sidebar.files.title'),
            subtitle: undefined,
            files: []
        }
    }

    componentDidMount = () => {
        this.getFiles();
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        if (this.props.contextData.community != prevProps.contextData.community) {
            this.setState({isLoading: true, subtitle:this.props.contextData.community ? this.props.contextData.community.name : undefined})
            this.getFiles()
        }
    }

    shouldComponentUpdate = (nextProps: Props, nextState: State) => {
        const search = this.state.query != nextState.query
        const loading = this.state.isLoading != nextState.isLoading
        const updatedCommunity = this.props.contextData.community != nextProps.contextData.community
        return search || loading || updatedCommunity
    }

    searchChanged = (es:EditorState) => {
        const searchData = SearcQueryManager.getContextSearchData(es, [])
        this.setState({query: searchData.query});
    }

    getFiles = () => {
        const community = this.props.contextData.community || this.props.activeCommunity
        this.setState({ isLoading: true, subtitle:community ? community.name : undefined })
        ApiClient.getFiles(ContextNaturalKey.COMMUNITY, community.id, 10000, 0, (data, status, error) => {
            if (data && data.results) {
                this.setState({ files: data.results, isLoading: false });
            }
        })
    }

    render = () => {
        var files = this.state.files.sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
        if (this.state.query && this.state.query.length > 0) {
            files = files.filter(file => file.filename.toLowerCase().includes(this.state.query.trim().toLowerCase()))
        }
        return (<>
            <div className="sidebar-content-header">
                <div className="sidebar-title">
                    {this.state.title}
                    { this.state.subtitle &&
                        <div className="sidebar-subtitle text-truncate">
                            {this.state.subtitle}
                        </div>
                    }
                </div>
            </div>
            <div className="sidebar-content-list">
                <div className="content d-flex flex-column">
                    <div className="search">
                        <SearchBar onSearchQueryChange={this.searchChanged}/>
                    </div>
                    <div className="items scrollbar flex-shrink-1">
                        {this.state.isLoading &&
                            <LoadingSpinner />
                            ||
                            files.map((file) => {if (file) {return <FileListItem key={"file-" + file.id} file={file}/>}})
                        }
                        { !this.state.isLoading && files.length == 0 &&
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

export default withContextData(connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(SideBarFilesContent))