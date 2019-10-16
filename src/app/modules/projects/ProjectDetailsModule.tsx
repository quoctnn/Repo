import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import "./ProjectDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { Project, ContextNaturalKey, Permission } from '../../types/intrasocial_types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DetailsMembers, HorisontalLayoutPosition } from '../../components/details/DetailsMembers';
import { DetailsContent } from '../../components/details/DetailsContent';
import { CommonModuleProps } from '../Module';
import classnames from 'classnames';
import { OverflowMenuItem, OverflowMenuItemType } from '../../components/general/OverflowMenu';
import { uniqueId } from '../../utilities/Utilities';
import ProjectCreateComponent from '../../components/general/contextCreation/ProjectCreateComponent';
import { DropDownMenu } from '../../components/general/DropDownMenu';
import ContextMembersForm from '../../components/general/contextMembers/ContextMembersForm';
import { withContextData, ContextDataProps } from '../../hoc/WithContextData';
import { ProjectController } from '../../managers/ProjectController';
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps
type State = {
    menuVisible:boolean
    isLoading:boolean
    editFormVisible:boolean
    editFormReloadKey:string
    membersFormVisible?:boolean
    membersFormReloadKey?:string
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxDispatchProps & ContextDataProps
class ProjectDetailsModule extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            menuVisible:false,
            editFormVisible:false,
            editFormReloadKey:uniqueId(),
            membersFormVisible:false,
            membersFormReloadKey:uniqueId(),
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
            ProjectController.partialUpdate(project)
        }
        this.hideProjectCreateForm()
    }
    getProjectOptions = (project:Project) => {
        const options: OverflowMenuItem[] = []
        if(project.permission >= Permission.moderate)
            options.push({id:"1", type:OverflowMenuItemType.option, title:translate("Edit"), onPress:this.showProjectCreateForm, iconClass:"fas fa-pen", iconStackClass:Permission.getShield(project.permission)})
        if(project.permission >= Permission.moderate)
            options.push({id:"members", type:OverflowMenuItemType.option, title:translate("common.member.management"), onPress:this.toggleMembersForm, iconClass:"fas fa-users-cog", iconStackClass:Permission.getShield(project.permission)})
        return options
    }
    renderEditForm = (project:Project) => {
        const visible = this.state.editFormVisible
        const {community} = this.props.contextData
        return <ProjectCreateComponent onCancel={this.hideProjectCreateForm} community={community.id} key={this.state.editFormReloadKey} project={project} visible={visible} onComplete={this.handleProjectCreateForm} />
    }
    toggleMembersForm = () => {
        this.setState((prevState:State) => {
            const invitationReloadKey = prevState.membersFormVisible ? null : uniqueId()
            return {membersFormVisible:!prevState.membersFormVisible, membersFormReloadKey: invitationReloadKey}
        })
    }
    renderMembersForm = (project:Project) => {
        const visible = this.state.membersFormVisible
        return <ContextMembersForm community={this.props.contextData.community} contextNaturalKey={ContextNaturalKey.PROJECT} key={this.state.membersFormReloadKey} didCancel={this.toggleMembersForm} visible={visible} contextObject={project} />
    }
    renderOptions = (project:Project) => {

        const projectOptions = this.getProjectOptions(project)
        if(projectOptions.length > 0)
            return <DropDownMenu className="project-option-dropdown" triggerClass="fas fa-cog mx-1" items={projectOptions}></DropDownMenu>
        return null
    }
    renderModule = (project:Project) => {
        if(!project)
            return null
        const { breakpoint, history, match, location, staticContext, contextNaturalKey, className, contextData,  ...rest} = this.props
        const {community} = this.props.contextData
        const cn = classnames("community-details-module", className)
        return <Module {...rest} className={cn}>
                    <ModuleHeader headerTitle={project && project.name || translate("detail.module.title")} loading={this.state.isLoading}>
                        {this.renderOptions(project)}
                    </ModuleHeader>
                    <ModuleContent>
                        { project && project.permission >= Permission.read &&
                            <div className="project-details-content">
                                <DetailsContent community={community} description={project.description}/>
                            </div>
                            ||
                            <LoadingSpinner key="loading"/>
                        }
                        {this.renderEditForm(project)}
                        {this.renderMembersForm(project)}
                    </ModuleContent>
                    { project && project.permission >= Permission.read &&
                        <ModuleFooter className="mt-1">
                            <div className="d-flex flex-row justify-content-between">
                                { project.managers &&
                                    <DetailsMembers title={translate('project.managers')} position={HorisontalLayoutPosition.left} members={project.managers} showSeeAll={false} />
                                }
                                <DetailsMembers onSeeAllClick={this.toggleMembersForm} members={project.members} />
                            </div>
                        </ModuleFooter>
                    }
                    </Module>
    }
    render()
    {
        const project = this.props.contextData.project
        if(!project)
            return null
        return this.renderModule(project) 
    }
}
export default withContextData(withRouter(ProjectDetailsModule))