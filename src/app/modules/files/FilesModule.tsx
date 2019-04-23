import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./FilesModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { ContextNaturalKey, Permissible, UploadedFile, Community } from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import { resolveContextObject, getContextObject } from '../newsfeed/NewsfeedModule';
import LoadingSpinner from '../../components/LoadingSpinner';
import SimpleModule from '../SimpleModule';
import { translate } from '../../localization/AutoIntlProvider';
import ListComponent from '../../components/general/ListComponent';
import ApiClient, { PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import FileListItem from './FileListItem';
import { CommunityManager } from '../../managers/CommunityManager';
type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
}
type State = {
    isLoading:boolean
}
type ReduxStateProps = {
    contextObject:Permissible & {id:number}
    contextNaturalKey:ContextNaturalKey
    community:Community
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class FilesModule extends React.Component<Props, State> {  
    filesList = React.createRef<ListComponent<UploadedFile>>()
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
        }
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
        const userId = this.props.contextNaturalKey == ContextNaturalKey.USER ? contextId : undefined
        const projectId = this.props.contextNaturalKey == ContextNaturalKey.PROJECT ? contextId : undefined
        const taskId = this.props.contextNaturalKey == ContextNaturalKey.TASK ? contextId : undefined
        const communityId = this.props.community && this.props.community.id
        //should get files from v2/files, but currently that endpoint does not support filtering on context, and does not have all fields needed(thumb etc)
        ApiClient.getCommunityFiles(communityId, 10, offset, (data, status, error) => {
            completion(data)
            ToastManager.showErrorToast(error)
        })
    }
    renderFile = (file:UploadedFile) =>  {
        return <FileListItem key={file.id} file={file} />
    }
    renderContent = (contextObject:Permissible) => {

        const {} = this.props
        return <>
            {!contextObject && <LoadingSpinner key="loading"/>}
            {contextObject && <ListComponent<UploadedFile> 
                        ref={this.filesList} 
                        onLoadingStateChanged={this.feedLoadingStateChanged} 
                        fetchData={this.fetchFiles} 
                        renderItem={this.renderFile} className="files-module-list" />}
            </>
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, contextObject, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("files-module", className)
        return (<SimpleModule {...rest} 
                    className={cn} 
                    headerClick={this.headerClick} 
                    breakpoint={breakpoint} 
                    isLoading={this.state.isLoading} 
                    title={translate("files.module.title")}>
                {this.renderContent(contextObject)}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {

    const resolveContext = state.resolvedContext
    const resolvedContext = resolveContextObject(resolveContext, ownProps.contextNaturalKey)
    const contextObject:any = resolvedContext && getContextObject(resolvedContext.contextNaturalKey, resolvedContext.contextObjectId)

    const community = resolveContext && !!resolveContext.communityId ? CommunityManager.getCommunity(resolveContext.communityId.toString()) : undefined
    return {
        contextObject,
        contextNaturalKey:resolvedContext && resolvedContext.contextNaturalKey,
        community
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(FilesModule))