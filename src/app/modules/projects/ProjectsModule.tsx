import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./ProjectsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { ContextNaturalKey, Community, Project } from '../../types/intrasocial_types';
import ListComponent from '../../components/general/ListComponent';
import ApiClient, { PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import { CommunityManager } from '../../managers/CommunityManager';
import ProjectsMenu, { ProjectsMenuData } from './ProjectsMenu';
import ProjectListItem from './ProjectListItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import SimpleModule from '../SimpleModule';
import { ContextManager } from '../../managers/ContextManager';
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
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    menuDataUpdated = (data:ProjectsMenuData) => {
        this.tempMenuData = data
    }
    fetchProjects = (offset:number, completion:(items:PaginationResult<Project>) => void ) => {
        let ordering = 'recent'  // TODO: Add filter to settings
        const communityId = this.props.community && this.props.community.id
        ApiClient.getProjects(communityId, 30, offset, ordering, (data, status, error) => {
            completion(data)
            ToastManager.showErrorToast(error)
        })
    }
    renderProject = (project:Project) =>  {
        return <ProjectListItem key={project.id} project={project} />
    }
    onMenuToggle = (visible:boolean) => {

        const newState:Partial<State> = {}
        if(!visible && this.tempMenuData) // update menudata
        {
            newState.menuData = this.tempMenuData
            this.tempMenuData = null
        }
        this.setState(newState as State)
    }
    renderContent = () => {
        return <>
            {!this.props.community && <LoadingSpinner key="loading"/>}
            {this.props.community && <ListComponent<Project> ref={this.projectsList} onLoadingStateChanged={this.feedLoadingStateChanged} fetchData={this.fetchProjects} renderItem={this.renderProject} />}
            </>
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, community, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("projects-module", className)
        const menu = <ProjectsMenu data={this.state.menuData} onUpdate={this.menuDataUpdated}  />
        return (<SimpleModule {...rest}
                    className={cn}
                    headerClick={this.headerClick}
                    breakpoint={breakpoint}
                    isLoading={this.state.isLoading}
                    onMenuToggle={this.onMenuToggle}
                    menu={menu}
                    headerTitle={translate("projects.module.title")}>
                {this.renderContent()}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps  & RouteComponentProps<any>):ReduxStateProps => {

    const community = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.COMMUNITY) as Community
    return {
        community
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ProjectsModule))