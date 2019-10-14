import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import "./GroupDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { Group, ContextNaturalKey, Permission } from '../../types/intrasocial_types';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import { DetailsContent } from '../../components/details/DetailsContent';
import { DetailsMembers } from '../../components/details/DetailsMembers';
import GroupCreateComponent from '../../components/general/contextCreation/GroupCreateComponent';
import { uniqueId } from '../../utilities/Utilities';
import { OverflowMenuItemType, OverflowMenuItem } from '../../components/general/OverflowMenu';
import { DropDownMenu } from '../../components/general/DropDownMenu';
import ContextMembersForm from '../../components/general/contextMembers/ContextMembersForm';
import ContextMembershipComponent from '../../components/general/contextMembership/ContextMembershipComponent';
import { withContextData, ContextDataProps } from '../../hoc/WithContextData';
import { GroupController } from '../../managers/GroupController';
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey: ContextNaturalKey
}
type State = {
    menuVisible:boolean
    isLoading:boolean
    editFormVisible:boolean
    editFormReloadKey:string
    membersFormVisible?:boolean
    membersFormReloadKey?:string
}
type Props = OwnProps & RouteComponentProps<any> & ContextDataProps
class GroupDetailsModule extends React.Component<Props, State> {
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
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    renderLoading = () => {
        if (this.state.isLoading) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>)
        }
    }
    showGroupCreateForm = () => {
        this.setState((prevState:State) => {
            return {editFormVisible:true, editFormReloadKey:uniqueId()}
        })
    }
    hideGroupCreateForm = (onComplete?:() => void) => {
        this.setState((prevState:State) => {
            return {editFormVisible:false}
        },onComplete)
    }
    handleGroupCreateForm = (group:Group) => {
        if(!!group)
        {
            GroupController.partialUpdate(group)
        }
        this.hideGroupCreateForm()
    }
    renderEditForm = () => {
        const visible = this.state.editFormVisible
        const {group} = this.props.contextData
        return <GroupCreateComponent onCancel={this.hideGroupCreateForm} community={group.community} key={this.state.editFormReloadKey} group={group} visible={visible} onComplete={this.handleGroupCreateForm} />
    }

    toggleMembersForm = () => {
        this.setState((prevState:State) => {
            const invitationReloadKey = prevState.membersFormVisible ? null : uniqueId()
            return {membersFormVisible:!prevState.membersFormVisible, membersFormReloadKey: invitationReloadKey}
        })
    }
    getGroupOptions = () => {
        const options: OverflowMenuItem[] = []
        const {group} = this.props.contextData
        if(group.permission >= Permission.admin)
            options.push({id:"1", type:OverflowMenuItemType.option, title:translate("Edit"), onPress:this.showGroupCreateForm, iconClass:"fas fa-pen", iconStackClass:Permission.getShield(group.permission)})
        if(group.permission >= Permission.admin)
        options.push({id:"members", type:OverflowMenuItemType.option, title:translate("common.member.management"), onPress:this.toggleMembersForm, iconClass:"fas fa-users-cog", iconStackClass:Permission.getShield(group.permission)})
        return options
    }
    renderMembersForm = () => {
        const visible = this.state.membersFormVisible
        const {community, group} = this.props.contextData
        return <ContextMembersForm community={community} contextNaturalKey={ContextNaturalKey.GROUP} key={this.state.membersFormReloadKey} didCancel={this.toggleMembersForm} visible={visible} contextObject={group} />
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, contextNaturalKey, contextData, ...rest} = this.props
        const {community, group} = this.props.contextData
        if(!group || !community)
            return null
        const groupOptions = this.getGroupOptions()
        return (<Module {...rest}>
                    <ModuleHeader headerTitle={group.name || translate("detail.module.title")} loading={this.state.isLoading}>
                        {groupOptions.length > 0 && <DropDownMenu className="group-option-dropdown" triggerClass="fas fa-cog mx-1" items={groupOptions}></DropDownMenu>} 
                    </ModuleHeader>
                    <ModuleContent>
                        <DetailsContent community={community} description={group.description}/>
                        {this.renderEditForm()}
                        {this.renderMembersForm()}
                    </ModuleContent>
                    <ModuleFooter className="mt-1">
                        <DetailsMembers onSeeAllClick={this.toggleMembersForm} members={group.members} />
                        <ContextMembershipComponent contextNaturalKey={ContextNaturalKey.GROUP} contextObject={group} />
                    </ModuleFooter>
                </Module>)
    }
}
export default withContextData(withRouter(GroupDetailsModule))