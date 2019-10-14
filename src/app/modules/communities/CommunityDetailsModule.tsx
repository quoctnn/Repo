import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import Module, { CommonModuleProps } from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import "./CommunityDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { Community, ContextNaturalKey, Permission, CommunityConfigurationData, Group, Event, Project, ObjectHiddenReason, IdentifiableObject, ElasticSearchType } from '../../types/intrasocial_types';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import { DetailsContent } from '../../components/details/DetailsContent';
import { DetailsMembers } from '../../components/details/DetailsMembers';
import FormController from '../../components/form/FormController';
import {ApiClient} from '../../network/ApiClient';
import classnames from 'classnames';
import { uniqueId } from '../../utilities/Utilities';
import { DropDownMenu } from '../../components/general/DropDownMenu';
import { OverflowMenuItem, OverflowMenuItemType } from '../../components/general/OverflowMenu';
import CommunityCreateComponent from '../../components/general/contextCreation/CommunityCreateComponent';
import GroupCreateComponent from '../../components/general/contextCreation/GroupCreateComponent';
import EventCreateComponent from '../../components/general/contextCreation/EventCreateComponent';
import ProjectCreateComponent from '../../components/general/contextCreation/ProjectCreateComponent';
import { CommunityManager } from '../../managers/CommunityManager';
import { ToastManager } from '../../managers/ToastManager';
import ContextMembersForm from '../../components/general/contextMembers/ContextMembersForm';
import AlertDialog from '../../components/general/dialogs/AlertDialog';
import ContextMembershipComponent from '../../components/general/contextMembership/ContextMembershipComponent';
import { withContextData, ContextDataProps } from '../../hoc/WithContextData';
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps
type State = {
    menuVisible:boolean
    isLoading:boolean
    editFormVisible:boolean
    editFormReloadKey?:string
    communityConfiguration?:CommunityConfigurationData
    createGroupFormVisible?:boolean
    createGroupFormReloadKey?:string
    createEventFormVisible?:boolean
    createEventFormReloadKey?:string
    createProjectFormVisible?:boolean
    createProjectFormReloadKey?:string
    membersFormVisible?:boolean
    membersFormReloadKey?:string
    inReviewDialogContextNaturalKey?:ContextNaturalKey
    inReviewDialogContextObject?:IdentifiableObject
}
type Props = OwnProps & RouteComponentProps<any> & ContextDataProps
class CommunityDetailsModule extends React.Component<Props, State> {
    formController:FormController = null
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            menuVisible:false,
            editFormVisible:false,
            editFormReloadKey:uniqueId(),
            communityConfiguration:null,
            createGroupFormVisible:false,
            createGroupFormReloadKey:uniqueId(),
            createEventFormVisible:false,
            createEventFormReloadKey:uniqueId(),
            createProjectFormVisible:false,
            createProjectFormReloadKey:uniqueId(),
            membersFormVisible:false,
            membersFormReloadKey:uniqueId(),
            inReviewDialogContextNaturalKey:null,
            inReviewDialogContextObject:null,
        }
    }
    componentDidUpdate = (prevProps:Props) => {
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    menuItemClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const visible = !this.state.menuVisible
        const newState:any = {menuVisible:visible}
        if(!visible)
        {
            /* TODO: Close the modal dialog with the group settings */
        } else {
            /* TODO: Show a modal dialog with the group settings */
        }
        this.setState(newState)
    }
    renderLoading = () => {
        if (this.state.isLoading) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>)
        }
    }
    loadConfigurationDataAndShowForm = () => {
        const community = this.props.contextData.community
        ApiClient.getCommunityConfiguration(community.id, (data, status, errorData) => {
            const success = !!data
            this.setState(() => {
                return {isLoading:false, communityConfiguration:data, editFormVisible:success, editFormReloadKey:uniqueId()}
            })
            ToastManager.showRequestErrorToast(errorData)
        })
    }
    toggleCommunityMembersForm = () => {
        this.setState((prevState:State) => {
            const invitationReloadKey = prevState.membersFormVisible ? null : uniqueId()
            return {membersFormVisible:!prevState.membersFormVisible, membersFormReloadKey: invitationReloadKey}
        })
    }
    showCommunityEditForm = () => {
        this.setState((prevState:State) => {
            return {isLoading:true}
        }, this.loadConfigurationDataAndShowForm )
    }
    hideCommunityEditForm = () => {

        this.setState((prevState:State) => {
            return {editFormVisible:false, communityConfiguration:null}
        })
    }
    handleCommunityEditFormComplete = (community:Community) => {
        if(!!community)
        {
            CommunityManager.storeCommunities([community])
            if(community.id == CommunityManager.getActiveCommunity().id)
                CommunityManager.applyCommunityTheme(community)
        }
        this.hideCommunityEditForm()
    }
    //
    showGroupCreateForm = () => {
        this.setState((prevState:State) => {
            return {createGroupFormVisible:true, createGroupFormReloadKey:uniqueId()}
        })
    }
    hideGroupCreateForm = () => {

        this.setState((prevState:State) => {
            return {createGroupFormVisible:false}
        })
    }
    showObjectInReview = (object:IdentifiableObject, contextNaturalKey:ContextNaturalKey) => {
        this.setState(() => {
            return {inReviewDialogContextNaturalKey:contextNaturalKey, inReviewDialogContextObject:object}
        })
    }
    hideObjectInReview = () => {
        this.setState(() => {
            return {inReviewDialogContextNaturalKey:null, inReviewDialogContextObject:null}
        })
    }
    renderObjectInReviewDialog = () => {
        const {inReviewDialogContextNaturalKey, inReviewDialogContextObject} = this.state
        let title:string = null
        let message:string = null
        const visible = !!inReviewDialogContextNaturalKey && !!inReviewDialogContextObject
        if(visible)
        {
            const elasticType = ContextNaturalKey.elasticTypeForKey(inReviewDialogContextNaturalKey)
            const objectName = ElasticSearchType.nameForKey(elasticType)
            const objectNameSingular = ElasticSearchType.nameSingularForKey(elasticType)
            title = translate("context.object.created.in.review.title").format(objectName)
            message = translate("context.object.created.in.review.message").format(objectNameSingular)
        }
        return <AlertDialog visible={visible} didClose={this.hideObjectInReview} title={title} message={message} />
    }
    handleGroupCreateForm = (group:Group) => {
        if(!!group)
        {
            if(group.hidden_reason && group.hidden_reason == ObjectHiddenReason.review)
            {
                this.showObjectInReview(group, ContextNaturalKey.GROUP)
                this.hideGroupCreateForm()
            }
            else if(group.uri)
            {
                window.app.navigateToRoute(group.uri)
            }
        }
    }
    //
    showEventCreateForm = () => {
        this.setState((prevState:State) => {
            return {createEventFormVisible:true, createEventFormReloadKey:uniqueId()}
        })
    }
    hideEventCreateForm = () => {

        this.setState((prevState:State) => {
            return {createEventFormVisible:false}
        })
    }
    handleEventCreateForm = (event:Event) => {
        if(!!event)
        {
            if(event.hidden_reason && event.hidden_reason == ObjectHiddenReason.review)
            {
                this.showObjectInReview(event, ContextNaturalKey.EVENT)
                this.hideEventCreateForm()
            }
            else if(event.uri)
            {
                window.app.navigateToRoute(event.uri)
            }
        }
    }
    //
    showProjectCreateForm = () => {
        this.setState((prevState:State) => {
            return {createProjectFormVisible:true, createProjectFormReloadKey:uniqueId()}
        })
    }
    hideProjectCreateForm = () => {

        this.setState((prevState:State) => {
            return {createProjectFormVisible:false}
        })
    }
    handleProjectCreateForm = (project:Project) => {
        if(!!project)
        {
            if(project.hidden_reason && project.hidden_reason == ObjectHiddenReason.review)
            {
                this.showObjectInReview(project, ContextNaturalKey.PROJECT)
                this.hideProjectCreateForm()
            }
            else if(project.uri)
            {
                window.app.navigateToRoute(project.uri)
            }
        }
    }
    getCommunityOptions = () => {
        const options: OverflowMenuItem[] = []
        const {community} = this.props.contextData
        if(!community)
            return options
        const permission = community.permission
        if(permission >= Permission.admin)
        {
            options.push({id:"edit", type:OverflowMenuItemType.option, title:translate("common.edit"), onPress:this.showCommunityEditForm, iconClass:"fas fa-pen", iconStackClass:Permission.getShield(permission)})
            options.push({id:"members", type:OverflowMenuItemType.option, title:translate("common.member.management"), onPress:this.toggleCommunityMembersForm, iconClass:"fas fa-users-cog", iconStackClass:Permission.getShield(permission)})
        }
        
        if(community.group_creation_permission >= Permission.limited_write)
            options.push({id:"2", type:OverflowMenuItemType.option, title:translate("group.add"), onPress:this.showGroupCreateForm, iconClass:"fas fa-plus"})
        
        if(community.event_creation_permission >= Permission.limited_write)
            options.push({id:"3", type:OverflowMenuItemType.option, title:translate("event.add"), onPress:this.showEventCreateForm, iconClass:"fas fa-plus"})
        
        if(community.project_creation_permission >= Permission.limited_write)
            options.push({id:"4", type:OverflowMenuItemType.option, title:translate("project.add"), onPress:this.showProjectCreateForm, iconClass:"fas fa-plus"})
        return options
    }
    renderMembersForm = () => {
        const visible = this.state.membersFormVisible
        const {community} = this.props.contextData
        return <ContextMembersForm contextNaturalKey={ContextNaturalKey.COMMUNITY} contextObject={community} key={this.state.membersFormReloadKey} didCancel={this.toggleCommunityMembersForm} visible={visible} community={community} />
    }
    renderEditForm = () => {
        const visible = this.state.editFormVisible
        const {community} = this.props.contextData
        const communityConfiguration = this.state.communityConfiguration
        return <CommunityCreateComponent onCancel={this.hideCommunityEditForm} key={this.state.editFormReloadKey} communityConfiguration={communityConfiguration} community={community} visible={visible} onComplete={this.handleCommunityEditFormComplete} />
    }
    renderAddGroupForm = () => {
        const visible = this.state.createGroupFormVisible
        const {community} = this.props.contextData
        return <GroupCreateComponent onCancel={this.hideGroupCreateForm} community={community.id} key={this.state.createGroupFormReloadKey} visible={visible} onComplete={this.handleGroupCreateForm} />
    }
    renderAddEventForm = () => {
        const visible = this.state.createEventFormVisible
        const {community} = this.props.contextData
        return <EventCreateComponent onCancel={this.hideEventCreateForm} community={community.id} key={this.state.createEventFormReloadKey} visible={visible} onComplete={this.handleEventCreateForm} />
    }
    renderAddProjectForm = () => {
        const visible = this.state.createProjectFormVisible
        const {community} = this.props.contextData
        return <ProjectCreateComponent onCancel={this.hideProjectCreateForm} community={community.id} key={this.state.createProjectFormReloadKey} visible={visible} onComplete={this.handleProjectCreateForm} />
    }
    render = () => {
        const {breakpoint, history, match, location, staticContext, contextNaturalKey, className, contextData, ...rest} = this.props
        const {community} = this.props.contextData
        if(!community)
            return null
        const cn = classnames("community-details-module", className)
        const communityOptions = this.getCommunityOptions()
        return (<Module {...rest} className={cn}>
                    <ModuleHeader headerTitle={community && community.name || translate("detail.module.title")} loading={this.state.isLoading}>
                       {communityOptions.length > 0 && <DropDownMenu className="community-option-dropdown" triggerClass="fas fa-cog mx-1" items={communityOptions}></DropDownMenu>} 
                    </ModuleHeader>
                    <ModuleContent>
                        { community && community.permission >= Permission.read &&
                            <DetailsContent description={community.description}/>
                        }
                        {this.renderEditForm()}
                        {this.renderAddGroupForm()}
                        {this.renderAddEventForm()}
                        {this.renderAddProjectForm()}
                        {this.renderMembersForm()}
                        {this.renderObjectInReviewDialog()}
                    </ModuleContent>
                    { community && community.permission >= Permission.read &&
                        <ModuleFooter className="mt-1">
                            <DetailsMembers onSeeAllClick={this.toggleCommunityMembersForm} members={community.members} />
                            <ContextMembershipComponent contextNaturalKey={ContextNaturalKey.COMMUNITY} contextObject={community} />
                        </ModuleFooter>
                    }
                </Module>)
    }
}
export default withContextData(withRouter(CommunityDetailsModule))