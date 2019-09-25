import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import ModuleMenuTrigger from '../ModuleMenuTrigger';
import "./ProjectDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { Project, Community, ContextNaturalKey, Permission } from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DetailsMembers, HorisontalLayoutPosition } from '../../components/details/DetailsMembers';
import { DetailsContent } from '../../components/details/DetailsContent';
import { ContextManager } from '../../managers/ContextManager';
import { CommonModuleProps } from '../Module';
import classnames from 'classnames';
import { OverflowMenuItem, OverflowMenuItemType } from '../../components/general/OverflowMenu';
import { uniqueId } from '../../utilities/Utilities';
import ProjectCreateComponent from '../../components/general/contextCreation/ProjectCreateComponent';
import { DropDownMenu } from '../../components/general/DropDownMenu';
import { ProjectManager } from '../../managers/ProjectManager';
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps
type State = {
    menuVisible:boolean
    isLoading:boolean
    editFormVisible:boolean
    editFormReloadKey:string
}
type ReduxStateProps = {
    community: Community
    project: Project
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class ProjectDetailsModule extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            menuVisible:false,
            editFormVisible:false,
            editFormReloadKey:uniqueId(),
        }
    }
    componentDidUpdate = (prevProps:Props) => {
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    showProjectCreateForm = () => {
        this.setState((prevState:State) => {
            return {editFormVisible:true, editFormReloadKey:uniqueId()}
        })
    }
    hideProjectCreateForm = () => {

        this.setState((prevState:State) => {
            return {editFormVisible:false}
        })
    }
    handleProjectCreateForm = (project:Project) => {
        if(!!project)
        {
            ProjectManager.storeProjects([project])
        }
        this.hideProjectCreateForm()
    }
    getProjectOptions = () => {
        const options: OverflowMenuItem[] = []
        if(this.props.project.permission >= Permission.admin)
            options.push({id:"1", type:OverflowMenuItemType.option, title:translate("Edit"), onPress:this.showProjectCreateForm, iconClass:"fas fa-pen"})
        return options
    }
    renderEditForm = () => {
        const visible = this.state.editFormVisible
        const {project, community} = this.props
        return <ProjectCreateComponent onCancel={this.hideProjectCreateForm} community={community.id} key={this.state.editFormReloadKey} project={project} visible={visible} onComplete={this.handleProjectCreateForm} />
    }
    render()
    {
        const { breakpoint, history, match, location, staticContext, project, community, contextNaturalKey, className,  ...rest} = this.props
        const cn = classnames("community-details-module", className)
        const projectOptions = this.getProjectOptions()
        return (<Module {...rest} className={cn}>
                    <ModuleHeader headerTitle={project && project.name || translate("detail.module.title")} loading={this.state.isLoading}>
                        {projectOptions.length > 0 && <DropDownMenu className="project-option-dropdown" triggerClass="fas fa-cog mx-1" items={projectOptions}></DropDownMenu>}
                    </ModuleHeader>
                    {true && //breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <ModuleContent>
                            { project && project.permission >= Permission.read &&
                                <div className="project-details-content">
                                    <DetailsContent community={community} description={project.description}/>
                                </div>
                                ||
                                <LoadingSpinner key="loading"/>
                            }
                            {this.renderEditForm()}
                        </ModuleContent>
                    }
                    { project && project.permission >= Permission.read &&
                        <ModuleFooter className="mt-1">
                            <div className="d-flex flex-row justify-content-between">
                                { project.managers &&
                                    <DetailsMembers title={translate('project.managers')} position={HorisontalLayoutPosition.left} members={project.managers} showSeeAll={false} />
                                }
                                <DetailsMembers members={project.members} />
                            </div>
                        </ModuleFooter>
                    }
                </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const project = ContextManager.getContextObject(ownProps.location.pathname, ownProps.contextNaturalKey) as Project
    const community = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.COMMUNITY) as Community
    return {
        community,
        project,
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ProjectDetailsModule))