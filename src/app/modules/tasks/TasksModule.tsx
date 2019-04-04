import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import classnames from "classnames"
import "./TasksModule.scss"
import ModuleMenu from '../ModuleMenu';
import ModuleMenuTrigger from '../ModuleMenuTrigger';
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import TaskMenu, { TasksMenuData } from './TasksMenu';
import TaskListComponent from './TaskListComponent';
import { ContextNaturalKey } from '../../types/intrasocial_types';
import { ReduxState } from '../../redux';
import { connect } from 'react-redux';
import { resolveContextObject, ResolvedContextObject } from '../newsfeed/NewsfeedModule';
import { ProjectManager } from '../../managers/ProjectManager';

type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
}
type State = {
    menuVisible:boolean
    isLoading:boolean
    menuData:TasksMenuData
}

type ReduxStateProps = {
    contextObjectId:number
    isResolvingContext:boolean
    resolvedContext: ResolvedContextObject
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxDispatchProps & ReduxStateProps
class TasksModule extends React.Component<Props, State> {  
    tempMenuData:TasksMenuData = null   
    constructor(props:Props) {
        super(props);
        this.state = {
            menuVisible:false,
            isLoading:false,
            menuData:{
                project:null,
                state: [],
                priority: [],
                assignedTo: null,
                responsible: null,
                tags: [],
                category: null,
                term: null,
                creator:null,
                notAssigned:null,
            }
        }
    }
    componentDidUpdate = (prevProps:Props) => {
        //turn off loading spinner if feed is removed
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    headerClick = (e) => {
        const context = this.state.menuData.project
        //NavigationUtilities.navigateToNewsfeed(this.props.history, context && context.type, context && context.id, this.state.includeSubContext)
    }
    menuItemClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const visible = !this.state.menuVisible
        const newState:any = {menuVisible:visible}
        if(!visible && this.tempMenuData)
        {
            newState.menuData = this.tempMenuData
            this.tempMenuData = null
        }
        this.setState(newState)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    renderLoading = () => {
        if (this.state.isLoading) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>)
        }
    }
    menuDataUpdated = (data:TasksMenuData) => {
        this.tempMenuData = data
    }
    getContextData = () => {
        if(this.props.contextObjectId)
        {
            const data = this.state.menuData
            if(!data.project)
            {
                const resolvedId = this.props.resolvedContext && this.props.resolvedContext.contextObjectId
                let name = ""
                if(resolvedId)
                    name = ProjectManager.getProject(resolvedId.toString()).name

                data.project = {label:`[${name}]`, id:this.props.contextObjectId, type:this.props.contextNaturalKey, value:this.props.contextNaturalKey + "_" + this.props.contextObjectId}
            }
            return data
        }
        return this.state.menuData
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, className, isResolvingContext, contextObjectId, contextNaturalKey, resolvedContext, ...rest} = this.props
        const cn = classnames("tasks-module", className, {"menu-visible":this.state.menuVisible})
        const headerClick = breakpoint < ResponsiveBreakpoint.standard ? this.headerClick : undefined
        const headerClass = classnames({link:headerClick})
        const headerSubtitle = this.state.menuData.project && this.state.menuData.project.label
        const contextData = this.getContextData()
        return (<Module {...rest} className={cn}>
                    <ModuleHeader className={headerClass} onClick={headerClick}>
                        <div className="flex-grow-1 text-truncate d-flex align-items-center">
                            <div className="text-truncate module-header-title-left">{translate("task.module.title")}</div>
                            {this.renderLoading()}
                            <div className="spacer flex-grow-1 flex-shrink-1"></div>
                            {!!headerSubtitle && 
                                <div className="module-header-title-right text-truncate">{headerSubtitle}</div>
                            }
                        </div>
                        <ModuleMenuTrigger onClick={this.menuItemClick} />
                    </ModuleHeader>
                    {breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <>
                            <ModuleContent>
                                <TaskListComponent 
                                    onLoadingStateChanged={this.feedLoadingStateChanged}  
                                    contextData={contextData}
                                    />
                            </ModuleContent>
                        </>
                    }
                    <ModuleMenu visible={this.state.menuVisible}>
                        <TaskMenu 
                            data={this.state.menuData}
                            onUpdate={this.menuDataUpdated}  />
                    </ModuleMenu>
                </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {

    const resolveContext = state.resolvedContext
    const resolvedContext = resolveContextObject(resolveContext, ownProps.contextNaturalKey)
    const isResolvingContext = resolvedContext && (!resolvedContext.contextObjectId && !resolvedContext.resolved)
    return {
        contextObjectId:resolvedContext && resolvedContext.contextObjectId,
        isResolvingContext,
        resolvedContext
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(TasksModule))