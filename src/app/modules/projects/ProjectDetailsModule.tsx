import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import "./ProjectDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { Project, ContextNaturalKey, Permission, Group } from '../../types/intrasocial_types';
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
import ContextConfirmableActionsComponent, { ContextConfirmableActions } from '../../components/general/context/ContextConfirmableActionsComponent';
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
    confirmActionComponent = React.createRef<ContextConfirmableActionsComponent>()
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
    showConfirmDeleteDialog = () => {
        this.confirmActionComponent && this.confirmActionComponent.current && this.confirmActionComponent.current.showAction(ContextConfirmableActions.delete)
    }
    showConfirmLeaveDialog = () => {
        this.confirmActionComponent && this.confirmActionComponent.current && this.confirmActionComponent.current.showAction(ContextConfirmableActions.leave)
    }
    toggleMute = () => {
        const action = this.props.contextData.project.muted ? ContextConfirmableActions.unmute : ContextConfirmableActions.mute
        this.confirmActionComponent && this.confirmActionComponent.current && this.confirmActionComponent.current.showAction(action, false)
    }
    getProjectOptions = (project:Project) => {
        const options: OverflowMenuItem[] = []
        const {authenticatedUser} = this.props.contextData
        const members = project.members || []
        if(project.permission >= Permission.moderate)
        {
            options.push({id:"edit", type:OverflowMenuItemType.option, title:translate("Edit"), onPress:this.showProjectCreateForm, iconClass:"fas fa-pen", iconStackClass:Permission.getShield(project.permission)})
            options.push({id:"members", type:OverflowMenuItemType.option, title:translate("common.member.management"), onPress:this.toggleMembersForm, iconClass:"fas fa-users-cog", iconStackClass:Permission.getShield(project.permission)})
            options.push({id:"delete", type:OverflowMenuItemType.option, title:translate("common.delete"), onPress:this.showConfirmDeleteDialog, iconClass:"fas fa-trash-alt", iconStackClass:Permission.getShield(project.permission)})
        }
        if(members.contains(authenticatedUser.id))
        {
            if(project.muted)
                options.push({id:"unmute", type:OverflowMenuItemType.option, title:translate("common.unmute"), onPress:this.toggleMute, iconClass:"fas fa-bell-slash"})
            else
                options.push({id:"mute", type:OverflowMenuItemType.option, title:translate("common.mute"), onPress:this.toggleMute, iconClass:"fas fa-bell"})
        }
        if(project.creator != authenticatedUser.id && members.contains(authenticatedUser.id))
            options.push({id:"leave", type:OverflowMenuItemType.option, title:translate("common.leave"), onPress:this.showConfirmLeaveDialog, iconClass:"fas fa-sign-out-alt"})
        return options
    }
    renderEditForm = (project:Project) => {
        const visible = this.state.editFormVisible
        const {community} = this.props.contextData
        const groups = (project.group && [project.group] || []) as Group[]
        return <ProjectCreateComponent groups={groups} onCancel={this.hideProjectCreateForm} community={community.id} key={this.state.editFormReloadKey} project={project} visible={visible} onComplete={this.handleProjectCreateForm} />
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
            return <DropDownMenu className="project-option-dropdown" triggerClass="fas fa-cog fa-2x mx-1" items={projectOptions}></DropDownMenu>
        return null
    }

    handleConfirmableActionComplete = (action:ContextConfirmableActions, contextNaturalKey:ContextNaturalKey, contextObjectId:number) => {
        this.props.contextData.reloadContextObject(contextObjectId, contextNaturalKey)
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
                                <DetailsContent community={community} group={project.group} description={project.description}/>
                            </div>
                            ||
                            <LoadingSpinner key="loading"/>
                        }
                        {this.renderEditForm(project)}
                        {this.renderMembersForm(project)}
                        <ContextConfirmableActionsComponent ref={this.confirmActionComponent} contextNaturalKey={ContextNaturalKey.PROJECT} contextObject={project} onActionComplete={this.handleConfirmableActionComplete} />
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