import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import classnames from "classnames"
import "./ProjectsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { ContextNaturalKey, Community, Project, ProjectSorting, Group } from '../../types/intrasocial_types';
import ListComponent from '../../components/general/ListComponent';
import {ApiClient,  PaginationResult } from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import ProjectsMenu from './ProjectsMenu';
import { ProjectsMenuData } from './ProjectsMenu';
import ProjectListItem from './ProjectListItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import SimpleModule from '../SimpleModule';
import { ContextManager } from '../../managers/ContextManager';
import { ButtonGroup, Button } from 'reactstrap';
import { CommonModuleProps } from '../Module';
import { OverflowMenuItem, OverflowMenuItemType } from '../../components/general/OverflowMenu';
import { DropDownMenu } from '../../components/general/DropDownMenu';
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps
type State = {
    menuVisible:boolean
    isLoading:boolean
    menuData:ProjectsMenuData
}
type ReduxStateProps = {
    community: Community
    group: Group
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class ProjectsModule extends React.Component<Props, State> {
    tempMenuData:ProjectsMenuData = null
    projectsList = React.createRef<ListComponent<Project>>()
    static defaultProps:CommonModuleProps = {
        pageSize:15,
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            menuVisible:false,
            isLoading:false,
            menuData:{
                sorting:ProjectSorting.mostUsed,
                responsible:false,
                assigned:false
            }
        }
    }
    componentWillUnmount = () => {
        this.tempMenuData = null
        this.projectsList = null
    }
    shouldReloadList = (prevProps:Props) => {
        return this.props.community && prevProps.community && this.props.community.id != prevProps.community.id
    }
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        if(this.shouldReloadList(prevProps) || this.contextDataChanged(prevState.menuData, prevProps))
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
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    menuDataUpdated = (data:ProjectsMenuData) => {
        this.tempMenuData = data
    }
    contextDataChanged = (prevData:ProjectsMenuData, prevProps:Props) => {
        const data = this.state.menuData
        return (prevData.sorting != data.sorting ||
                prevData.responsible != data.responsible ||
                prevData.assigned != data.assigned)
    }
    fetchProjects = (offset:number, completion:(items:PaginationResult<Project>) => void ) => {
        const md = this.state.menuData
        const communityId = this.props.community && this.props.community.id
        const groupId = this.props.group && this.props.group.id
        ApiClient.getProjects(communityId, groupId, this.props.pageSize, offset, md.sorting, md.responsible, md.assigned, (data, status, error) => {
            completion(data)
            ToastManager.showRequestErrorToast(error)
        })
    }
    renderProject = (project:Project) =>  {
        return <ProjectListItem key={project.id} project={project} />
    }
    onMenuToggle = (visible:boolean) => {
        const newState:Partial<State> = {}
        newState.menuVisible = visible
        if(!visible && this.tempMenuData) // update menudata
        {
            newState.menuData = this.tempMenuData
            this.tempMenuData = null
        }
        this.setState(newState as State)
    }
    toggleSorting = (sorting: ProjectSorting) => (e) => {
        const md = { ... this.state.menuData }
        md.sorting = sorting
        this.setState({menuData:md})
    }
    renderSorting = () => {
        if(this.state.menuVisible)
            return null
        const ddi: OverflowMenuItem[] = ProjectSorting.all.map(s => {
            return {
                id:s,
                type:OverflowMenuItemType.option,
                onPress:this.toggleSorting(s),
                title:ProjectSorting.translatedText(s),
                iconClass:ProjectSorting.icon(s),
            }
        })
        const title = ProjectSorting.translatedText(this.state.menuData.sorting)
        return <DropDownMenu triggerIcon={ProjectSorting.icon(this.state.menuData.sorting)} triggerTitle={title} triggerClass="fas fa-caret-down mx-1" items={ddi}></DropDownMenu>
    }
    renderContent = () => {
        return <>
            {!this.props.community && <LoadingSpinner key="loading"/>}
            {this.props.community && <ListComponent<Project> ref={this.projectsList}
                        loadMoreOnScroll={!this.props.showLoadMore} onLoadingStateChanged={this.feedLoadingStateChanged} fetchData={this.fetchProjects} renderItem={this.renderProject} />}
            </>
    }
    renderModalContent = () => {
        return <ProjectsModule {...this.props} pageSize={50} style={{height:undefined, maxHeight:undefined}} showLoadMore={false} showInModal={false} isModal={true}/>
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, community, pageSize, showLoadMore, showInModal, isModal, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("projects-module", className)
        const menu = <ProjectsMenu data={this.state.menuData} onUpdate={this.menuDataUpdated}  />
        const headerContent = this.renderSorting()
        const renderModalContent = !showInModal || isModal ? undefined : this.renderModalContent
        return (<SimpleModule {...rest}
                    showHeaderTitle={!isModal}
                    renderModalContent={renderModalContent}
                    className={cn}
                    headerClick={this.headerClick}
                    breakpoint={breakpoint}
                    isLoading={this.state.isLoading}
                    onMenuToggle={this.onMenuToggle}
                    menu={menu}
                    headerContent={headerContent}
                    headerTitle={translate("projects.module.title")}>
                {this.renderContent()}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps  & RouteComponentProps<any>):ReduxStateProps => {

    const community = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.COMMUNITY) as Community
    const group = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.GROUP) as Group
    return {
        community,
        group
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ProjectsModule))