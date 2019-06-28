import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./FilesModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { Permissible, UploadedFile, IdentifiableObject, UserProfile, ContextNaturalKey } from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import LoadingSpinner from '../../components/LoadingSpinner';
import SimpleModule from '../SimpleModule';
import { translate } from '../../localization/AutoIntlProvider';
import ListComponent from '../../components/general/ListComponent';
import ApiClient, { PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import FileListItem from './FileListItem';
import { ContextManager } from '../../managers/ContextManager';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { CommonModuleProps } from '../Module';
import FileGridItem from './FileGridItem';
import { ButtonGroup, Button } from 'reactstrap';
import { ResizeObserverColumnsComponent } from '../../components/general/observers/ResizeObserverColumnsComponent';
export type FilesMenuData = {
    viewMode:ListViewMode
}
export enum ListViewMode {
    list,
    grid
}
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
    viewMode?:ListViewMode
} & CommonModuleProps
type State = {
    isLoading:boolean
    menuData:FilesMenuData
}
type ReduxStateProps = {
    contextObject:Permissible & IdentifiableObject
    authenticatedUser:UserProfile
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class FilesModule extends React.Component<Props, State> {  
    filesList = React.createRef<ListComponent<UploadedFile>>()
    static defaultProps:CommonModuleProps = {
        pageSize:15,
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            menuData:{
                viewMode:props.viewMode || ListViewMode.list
            }
        }
    }
    componentWillUnmount = () => {
        this.filesList = null
    }
    shouldReloadList = (prevProps:Props) => {
        return this.props.contextObject && prevProps.contextObject && this.props.contextObject.id != prevProps.contextObject.id
    }
    componentDidUpdate = (prevProps:Props) => {
        if(this.shouldReloadList(prevProps))
        {
            this.filesList.current.reload()
        }
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    headerClick = (e) => {
        //NavigationUtilities.navigateToNewsfeed(this.props.history, context && context.type, context && context.id, this.state.includeSubContext)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    fetchFiles = (offset:number, completion:(items:PaginationResult<UploadedFile>) => void ) => {
        const contextId = (this.props.contextObject && this.props.contextObject.id) || undefined
        ApiClient.getFiles(this.props.contextNaturalKey, contextId, this.props.pageSize, offset, (data, status, error) => {
            completion(data)
            ToastManager.showErrorToast(error)
        })
    }
    handleRenameFile = (file: UploadedFile, name: string) => {
        if(!name || name.length == 0)
            return
        ApiClient.updateFilename(file.id, name, (data, status, error) => {
            if(!!data && !error)
            {
                this.filesList.current.updateItem(data)
            }
            ToastManager.showErrorToast(error, status, translate("Could not update filename"))
        })
    }
    renderFile = (file:UploadedFile) =>  {
        if(this.state.menuData.viewMode == ListViewMode.list)
            return <FileListItem key={file.id} file={file} />
        return <FileGridItem key={file.id} file={file} />
    }
    isListMode = () => {
        return this.state.menuData.viewMode == ListViewMode.list
    }
    renderContent = (contextObject:Permissible) => {

        const {showLoadMore} = this.props
        const waiting = this.props.contextNaturalKey && !contextObject
        if(waiting)
            return <LoadingSpinner key="loading"/>
        const cn = classnames("files-module-list", {grid:!this.isListMode()})
        if(this.isListMode())
        {
            return <ListComponent<UploadedFile> 
            ref={this.filesList} 
            onLoadingStateChanged={this.feedLoadingStateChanged} 
            fetchData={this.fetchFiles} 
            loadMoreOnScroll={!showLoadMore}
            renderItem={this.renderFile} 
            className={cn} />
        }
        return <ResizeObserverColumnsComponent targetColumnWidth={200} 
                render={(state) => {
                return <ListComponent<UploadedFile> 
                            ref={this.filesList} 
                            onLoadingStateChanged={this.feedLoadingStateChanged} 
                            fetchData={this.fetchFiles} 
                            loadMoreOnScroll={!showLoadMore}
                            renderItem={this.renderFile} 
                            className={cn + " grid-size-" + state.colums} />
            }}></ResizeObserverColumnsComponent>
    }
    toggleViewMode = () => {
        this.setState((prevState:State) => {
            const menuData = {...prevState.menuData}
            menuData.viewMode = this.isListMode() ? ListViewMode.grid : ListViewMode.list
            return {menuData}
        })
    }
    renderHeaderContent = () => {
        const viewModeIconClass = this.state.menuData.viewMode == ListViewMode.list ? "fas fa-th-large" : "fas fa-th-list"
        return (<ButtonGroup className="header-filter-group">
                    <Button size="xs" onClick={this.toggleViewMode} color="light">
                        <i className={viewModeIconClass}></i>
                    </Button>
                </ButtonGroup>)
    }
    renderModalContent = () => {
        return <FilesModule {...this.props} pageSize={50} style={{height:undefined, maxHeight:undefined}} showLoadMore={false} showInModal={false} isModal={true}/>
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, contextObject,authenticatedUser, pageSize, showLoadMore, showInModal, isModal, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("files-module", className)
        const headerContent = undefined //this.renderHeaderContent()
        const renderModalContent = !showInModal || isModal ? undefined : this.renderModalContent
        return (<SimpleModule {...rest} 
                    showHeader={!isModal}
                    className={cn} 
                    headerClick={this.headerClick} 
                    breakpoint={breakpoint} 
                    isLoading={this.state.isLoading} 
                    renderModalContent={renderModalContent}
                    headerContent={headerContent}
                    headerTitle={translate("files.module.title")}>
                {this.renderContent(contextObject)}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const contextObject = ContextManager.getContextObject(ownProps.location.pathname, ownProps.contextNaturalKey)
    return {
        contextObject,
        authenticatedUser: AuthenticationManager.getAuthenticatedUser()
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(FilesModule))