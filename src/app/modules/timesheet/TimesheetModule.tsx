import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./TimesheetModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { ContextNaturalKey, Permissible, Timesheet } from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import { resolveContextObject, getContextObject } from '../newsfeed/NewsfeedModule';
import LoadingSpinner from '../../components/LoadingSpinner';
import SimpleModule from '../SimpleModule';
import { translate } from '../../localization/AutoIntlProvider';
import ListComponent from '../../components/general/ListComponent';
import TimesheetListItem from './TimesheetListItem';
import ApiClient, { PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
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
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class TimesheetModule extends React.Component<Props, State> {  
    timesheetList = React.createRef<ListComponent<Timesheet>>()
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
            this.timesheetList.current.reload()
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
    fetchTimesheets = (offset:number, completion:(items:PaginationResult<Timesheet>) => void ) => {
        const contextId = (this.props.contextObject && this.props.contextObject.id) || undefined
        const userId = this.props.contextNaturalKey == ContextNaturalKey.USER ? contextId : undefined
        const projectId = this.props.contextNaturalKey == ContextNaturalKey.PROJECT ? contextId : undefined
        const taskId = this.props.contextNaturalKey == ContextNaturalKey.TASK ? contextId : undefined
        ApiClient.getTimesheets(userId, projectId, taskId, 30, offset, (data, status, error) => {
            completion(data)
            ToastManager.showErrorToast(error)
        })
    }
    renderTimesheet = (timesheet:Timesheet) =>  {
        return <TimesheetListItem key={timesheet.id} timesheet={timesheet} />
    }
    renderEmpty = () => {
        return <div>{"Empty List"}</div>
    }
    renderContent = (contextObject:Permissible) => {

        const {} = this.props
        return <>
            {!contextObject && <LoadingSpinner key="loading"/>}
            {contextObject && <ListComponent<Timesheet> 
                        ref={this.timesheetList} 
                        renderEmpty={this.renderEmpty}
                        onLoadingStateChanged={this.feedLoadingStateChanged} 
                        fetchData={this.fetchTimesheets} 
                        renderItem={this.renderTimesheet} className="timesheet-module-list" />}
            </>
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, contextObject, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("timesheet-module", className)
        return (<SimpleModule {...rest} 
                    className={cn} 
                    headerClick={this.headerClick} 
                    breakpoint={breakpoint} 
                    isLoading={this.state.isLoading} 
                    title={translate("timesheet.module.title")}>
                {this.renderContent(contextObject)}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {

    const resolveContext = state.resolvedContext
    const resolvedContext = resolveContextObject(resolveContext, ownProps.contextNaturalKey)
    const contextObject:any = resolvedContext && getContextObject(resolvedContext.contextNaturalKey, resolvedContext.contextObjectId)
    return {
        contextObject,
        contextNaturalKey:resolvedContext && resolvedContext.contextNaturalKey
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(TimesheetModule))