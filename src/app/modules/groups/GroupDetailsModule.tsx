import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import "./GroupDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { Group, Community, ContextNaturalKey, Permission } from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DetailsContent } from '../../components/details/DetailsContent';
import { DetailsMembers } from '../../components/details/DetailsMembers';
import { ContextManager } from '../../managers/ContextManager';
import GroupCreateComponent from '../../components/general/contextCreation/GroupCreateComponent';
import { uniqueId } from '../../utilities/Utilities';
import { OverflowMenuItemType, OverflowMenuItem } from '../../components/general/OverflowMenu';
import { DropDownMenu } from '../../components/general/DropDownMenu';
import { GroupManager } from '../../managers/GroupManager';
import ContextInvitationComponent from '../../components/general/contextInvitation/ContextInvitationComponent';
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey: ContextNaturalKey
}
type State = {
    menuVisible:boolean
    isLoading:boolean
    editFormVisible:boolean
    editFormReloadKey:string
    invitationListVisible?:boolean
    invitationReloadKey?:string
}
type ReduxStateProps = {
    community: Community
    group: Group
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class GroupDetailsModule extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            menuVisible:false,
            editFormVisible:false,
            editFormReloadKey:uniqueId(),
            invitationListVisible:false,
            invitationReloadKey:uniqueId(),
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
            GroupManager.storeGroups([group])
        }
        this.hideGroupCreateForm()
    }
    renderEditForm = () => {
        const visible = this.state.editFormVisible
        const group = this.props.group
        return <GroupCreateComponent onCancel={this.hideGroupCreateForm} community={group.community} key={this.state.editFormReloadKey} group={group} visible={visible} onComplete={this.handleGroupCreateForm} />
    }

    toggleInviteForm = () => {
        this.setState((prevState:State) => {
            const invitationReloadKey = prevState.invitationListVisible ? null : uniqueId()
            return {invitationListVisible:!prevState.invitationListVisible, invitationReloadKey}
        })
    }
    getGroupOptions = () => {
        const options: OverflowMenuItem[] = []
        if(this.props.group.permission >= Permission.admin)
            options.push({id:"1", type:OverflowMenuItemType.option, title:translate("Edit"), onPress:this.showGroupCreateForm, iconClass:"fas fa-pen", iconStackClass:Permission.getShield(this.props.group.permission)})
        if(this.props.group.permission >= Permission.admin)
            options.push({id:"invite", type:OverflowMenuItemType.option, title:translate("common.invitations"), onPress:this.toggleInviteForm, iconClass:"fas fa-paper-plane", iconStackClass:Permission.getShield(this.props.group.permission)})
        return options
    }
    renderInvitationList = () => {
        const visible = this.state.invitationListVisible
        const contextObject = this.props.group
        return <ContextInvitationComponent  members={contextObject.members} availableMembers={this.props.community.members} contextNaturalKey={ContextNaturalKey.GROUP} key={this.state.invitationReloadKey} didCancel={this.toggleInviteForm} visible={visible} contextObject={contextObject} />
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, group, community, contextNaturalKey, ...rest} = this.props
        const groupOptions = this.getGroupOptions()
        return (<Module {...rest}>
                    <ModuleHeader headerTitle={group && group.name || translate("detail.module.title")} loading={this.state.isLoading}>
                        {groupOptions.length > 0 && <DropDownMenu className="group-option-dropdown" triggerClass="fas fa-cog mx-1" items={groupOptions}></DropDownMenu>} 
                    </ModuleHeader>
                    <ModuleContent>
                        { group &&
                            <div>
                                { group.permission >= Permission.read &&
                                    <DetailsContent community={community} description={group.description}/>
                                }
                            </div>
                            ||
                            <LoadingSpinner key="loading"/>
                        }
                        {this.renderEditForm()}
                        {this.renderInvitationList()}
                    </ModuleContent>
                    {group && group.permission >= Permission.read &&
                        <ModuleFooter className="mt-1">
                            <DetailsMembers members={group.members} />
                        </ModuleFooter>
                    }
                </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const group = ContextManager.getContextObject(ownProps.location.pathname, ownProps.contextNaturalKey) as Group
    const community = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.COMMUNITY) as Community
    return {
        community,
        group,
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(GroupDetailsModule))