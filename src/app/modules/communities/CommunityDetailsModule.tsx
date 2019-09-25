import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import Module, { CommonModuleProps } from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import "./CommunityDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { Community, ContextNaturalKey, Permission, CommunityConfigurationData, Group, Event, Project} from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DetailsContent } from '../../components/details/DetailsContent';
import { DetailsMembers } from '../../components/details/DetailsMembers';
import { ContextManager } from '../../managers/ContextManager';
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
import { GroupManager } from '../../managers/GroupManager';
import { EventManager } from '../../managers/EventManager';
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
}
type ReduxStateProps = {
    community: Community
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
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
        const community = this.props.community
        ApiClient.getCommunityConfiguration(community.id, (data, status, errorData) => {
            this.setState(() => {
                return {isLoading:false, communityConfiguration:data, editFormVisible:true, editFormReloadKey:uniqueId()}
            })
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
            const prevCommunity = this.props.community
            CommunityManager.storeCommunities([community])
            if(community.id == CommunityManager.getActiveCommunity().id)
                CommunityManager.applyCommunityTheme(community)
            if(community.uri && prevCommunity.uri != community.uri)
            {
                window.app.navigateToRoute(community.uri)
            }
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
    handleGroupCreateForm = (group:Group) => {
        if(!!group)
        {
            GroupManager.storeGroups([group])
            if(group.uri)
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
            EventManager.storeEvents([event])
            if(event.uri)
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
        if(project && project.uri)
        {
            window.app.navigateToRoute(project.uri)
        }
    }
    getCommunityOptions = () => {
        const options: OverflowMenuItem[] = []
        if(this.props.community.permission >= Permission.admin)
            options.push({id:"1", type:OverflowMenuItemType.option, title:translate("Edit"), onPress:this.showCommunityEditForm, iconClass:"fas fa-pen"})
        
        if(this.props.community.group_creation_permission >= Permission.write)
            options.push({id:"2", type:OverflowMenuItemType.option, title:translate("group.add"), onPress:this.showGroupCreateForm, iconClass:"fas fa-plus"})
        
        if(this.props.community.event_creation_permission >= Permission.write)
            options.push({id:"3", type:OverflowMenuItemType.option, title:translate("event.add"), onPress:this.showEventCreateForm, iconClass:"fas fa-plus"})
        
        if(this.props.community.project_creation_permission >= Permission.write)
            options.push({id:"4", type:OverflowMenuItemType.option, title:translate("project.add"), onPress:this.showProjectCreateForm, iconClass:"fas fa-plus"})
        return options
    }
    renderEditForm = () => {
        const visible = this.state.editFormVisible
        const community = this.props.community
        const communityConfiguration = this.state.communityConfiguration
        return <CommunityCreateComponent onCancel={this.hideCommunityEditForm} key={this.state.editFormReloadKey} communityConfiguration={communityConfiguration} community={community} visible={visible} onComplete={this.handleCommunityEditFormComplete} />
    }
    renderAddGroupForm = () => {
        const visible = this.state.createGroupFormVisible
        const community = this.props.community
        return <GroupCreateComponent onCancel={this.hideGroupCreateForm} community={community.id} key={this.state.createGroupFormReloadKey} visible={visible} onComplete={this.handleGroupCreateForm} />
    }
    renderAddEventForm = () => {
        const visible = this.state.createEventFormVisible
        const community = this.props.community
        return <EventCreateComponent onCancel={this.hideEventCreateForm} community={community.id} key={this.state.createEventFormReloadKey} visible={visible} onComplete={this.handleEventCreateForm} />
    }
    renderAddProjectForm = () => {
        const visible = this.state.createProjectFormVisible
        const community = this.props.community
        return <ProjectCreateComponent onCancel={this.hideProjectCreateForm} community={community.id} key={this.state.createProjectFormReloadKey} visible={visible} onComplete={this.handleProjectCreateForm} />
    }
    render = () => {
        const {breakpoint, history, match, location, staticContext, community, contextNaturalKey, className, ...rest} = this.props
        const cn = classnames("community-details-module", className)
        const communityOptions = this.getCommunityOptions()
        return (<Module {...rest} className={cn}>
                    <ModuleHeader headerTitle={community && community.name || translate("detail.module.title")} loading={this.state.isLoading}>
                       {communityOptions.length > 0 && <DropDownMenu className="community-option-dropdown" triggerClass="fas fa-cog mx-1" items={communityOptions}></DropDownMenu>} 
                    </ModuleHeader>
                    {true && //breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <ModuleContent>
                            { community && community.permission >= Permission.read &&
                                <DetailsContent description={community.description}/>
                            ||
                            <LoadingSpinner key="loading"/>
                            }
                            {this.renderEditForm()}
                            {this.renderAddGroupForm()}
                            {this.renderAddEventForm()}
                            {this.renderAddProjectForm()}
                        </ModuleContent>
                    }
                    { community && community.permission >= Permission.read &&
                        <ModuleFooter className="mt-1">
                            <DetailsMembers members={community.members} />
                        </ModuleFooter>
                    }
                </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const community = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.COMMUNITY) as Community
    return {
        community,
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(CommunityDetailsModule))