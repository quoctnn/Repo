import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./FilesModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { ContextNaturalKey, Permissible, UploadedFile, Community, IdentifiableObject } from '../../types/intrasocial_types';
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
type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
}
type State = {
    isLoading:boolean
}
type ReduxStateProps = {
    contextObject:Permissible & IdentifiableObject
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
        ApiClient.getFiles(this.props.contextNaturalKey, contextId, 10, offset, (data, status, error) => {
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
                    headerTitle={translate("files.module.title")}>
                {this.renderContent(contextObject)}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const contextObject = ContextManager.getContextObject(ownProps.location.pathname, ownProps.contextNaturalKey)
    return {
        contextObject,
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(FilesModule))