import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./TimesheetModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { ContextNaturalKey, Permissible, Timesheet, IdentifiableObject } from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import LoadingSpinner from '../../components/LoadingSpinner';
import SimpleModule from '../SimpleModule';
import { translate } from '../../localization/AutoIntlProvider';
import ListComponent from '../../components/general/ListComponent';
import TimesheetListItem from './TimesheetListItem';
import ApiClient, { PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { ContextManager } from '../../managers/ContextManager';
type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
}
type DefaultProps = {
    showTaskTitles?:boolean
}
type State = {
    isLoading:boolean
}
type ReduxStateProps = {
    contextObject:Permissible & IdentifiableObject
}
type ReduxDispatchProps = {
}
type Props = DefaultProps & OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class TimesheetModule extends React.Component<Props, State> {
    timesheetList = React.createRef<ListComponent<Timesheet>>()
    static defaultProps: DefaultProps = {
        showTaskTitles: true
    }
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
        const showTitles = this.props.showTaskTitles
        return <TimesheetListItem key={timesheet.id} timesheet={timesheet} showTaskTitle={showTitles}/>
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
        const {history, match, location, staticContext, contextNaturalKey, contextObject, showTaskTitles, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("timesheet-module", className)
        return (<SimpleModule {...rest}
                    className={cn}
                    headerClick={this.headerClick}
                    breakpoint={breakpoint}
                    isLoading={this.state.isLoading}
                    headerTitle={translate("timesheet.module.title")}>
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
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(TimesheetModule))