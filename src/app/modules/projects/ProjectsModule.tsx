import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import classnames from "classnames"
import "./ProjectsModule.scss"
import ModuleMenu from '../ModuleMenu';
import ModuleMenuTrigger from '../ModuleMenuTrigger';
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import { ContextNaturalKey, Community, Project } from '../../types/intrasocial_types';
import ListComponent from '../../components/general/ListComponent';
import ApiClient, { PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import { CommunityManager } from '../../managers/CommunityManager';
import ProjectsMenu, { ProjectsMenuData } from './ProjectsMenu';
import ProjectListItem from './ProjectListItem';
import { NavigationUtilities } from '../../utilities/NavigationUtilities';
import LoadingSpinner from '../../components/LoadingSpinner';
type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
}
type State = {
    menuVisible:boolean
    isLoading:boolean
    menuData:ProjectsMenuData
}
type ReduxStateProps = {
    community: Community
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class ProjectsModule extends React.Component<Props, State> {  
    tempMenuData:ProjectsMenuData = null   
    projectsList = React.createRef<ListComponent<Project>>()
    constructor(props:Props) {
        super(props);
        this.state = {
            menuVisible:false,
            isLoading:false,
            menuData:{
            }
        }
    }
    shouldReloadList = (prevProps:Props) => {
        return this.props.community && prevProps.community && this.props.community.id != prevProps.community.id
    }
    componentDidUpdate = (prevProps:Props) => {
        if(this.shouldReloadList(prevProps))
        {
            this.projectsList.current.reload()
        }
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    headerClick = (e) => {
        const context = this.state.menuData
        //NavigationUtilities.navigateToNewsfeed(this.props.history, context && context.type, context && context.id, this.state.includeSubContext)
    }
    menuItemClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const visible = !this.state.menuVisible
        const newState:any = {menuVisible:visible}
        if(!visible && this.tempMenuData) // update menudata
        {
            newState.menuData = this.tempMenuData
            this.tempMenuData = null
        }
        this.setState(newState)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    menuDataUpdated = (data:ProjectsMenuData) => {
        this.tempMenuData = data
    }
    fetchProjects = (offset:number, completion:(items:PaginationResult<Project>) => void ) => {
        const communityId = this.props.community && this.props.community.id
        ApiClient.getProjects(communityId, 30, offset, (data, status, error) => {
            completion(data)
            ToastManager.showErrorToast(error)
        })
    }
    renderProject = (project:Project) =>  {
        return <ProjectListItem key={project.id} project={project} />
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, className, contextNaturalKey, community, ...rest} = this.props
        const cn = classnames("projects-module", className, {"menu-visible":this.state.menuVisible})
        const headerClick = breakpoint < ResponsiveBreakpoint.standard ? this.headerClick : undefined
        const headerClass = classnames({link:headerClick})
        return (<Module {...rest} className={cn}>
                    <ModuleHeader className={headerClass} onClick={headerClick} title={translate("projects.module.title")} loading={this.state.isLoading}>
                        <ModuleMenuTrigger onClick={this.menuItemClick} />
                    </ModuleHeader>
                    {breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <>
                            <ModuleContent>
                                {!this.props.community && <LoadingSpinner key="loading"/>}
                                {this.props.community && <ListComponent<Project> ref={this.projectsList} onLoadingStateChanged={this.feedLoadingStateChanged} fetchData={this.fetchProjects} renderItem={this.renderProject} />}
                            </ModuleContent>
                        </>
                    }
                    <ModuleMenu visible={this.state.menuVisible}>
                        <ProjectsMenu 
                            data={this.state.menuData}
                            onUpdate={this.menuDataUpdated}  />
                    </ModuleMenu>
                </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {

    const resolveContext = state.resolvedContext
    const community = resolveContext && !!resolveContext.communityId ? CommunityManager.getCommunity(resolveContext.communityId.toString()) : undefined
    return {
        community
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ProjectsModule))