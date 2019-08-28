import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from "react-router-dom";
import classnames from "classnames"
import "./ConversationDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { ContextNaturalKey, Conversation, UserProfile, UserStatus } from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import SimpleModule from '../SimpleModule';
import { ContextManager } from '../../managers/ContextManager';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { tempConversationId, ConversationActionArchiveNotification, ConversationActionLeaveNotification, ConversationActionRemoveUsersNotification } from '../conversations/ConversationsModule';
import { ConversationUtilities } from '../../utilities/ConversationUtilities';
import ApiClient from '../../network/ApiClient';
import { ToastManager } from '../../managers/ToastManager';
import { translate } from '../../localization/AutoIntlProvider';
import { ProfileManager } from '../../managers/ProfileManager';
import { ListItem, List, ListHeader } from '../../components/general/List';
import { uniqueId, userFullName, userAvatar } from '../../utilities/Utilities';
import Avatar from '../../components/general/Avatar';
import SelectUsersDialog from '../../components/general/dialogs/SelectUsersDialog';
import { InputGroup, Input } from 'reactstrap';
import { DropDownMenu } from '../../components/general/DropDownMenu';
import { OverflowMenuItem, OverflowMenuItemType } from '../../components/general/OverflowMenu';
import { NotificationCenter } from '../../utilities/NotificationCenter';
type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey?:ContextNaturalKey
}
type State = {
    title:string
    addMembersDialogVisible:boolean
    canSubmitNewMembers:boolean
}
type ReduxStateProps = {
    conversation: Conversation
    authenticatedUser:UserProfile
    createNewConversation:boolean
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class ConversationDetailsModule extends React.Component<Props, State> {

    titleRef = React.createRef<HTMLInputElement>();
    constructor(props:Props) {
        super(props);
        this.state = {
            title:this.getTitle(props),
            addMembersDialogVisible:false,
            canSubmitNewMembers:false
        }
    }
    shouldUpdate = (prevProps:Props) => {
        const oldConversation = prevProps.conversation
        const newConversation = this.props.conversation
        return (oldConversation && !newConversation) ||
                (!oldConversation && newConversation) ||
                (oldConversation && newConversation && (oldConversation.id != newConversation.id || oldConversation.updated_at != newConversation.updated_at))
    }
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        if(this.shouldUpdate(prevProps))
        {
            this.setState(() => {
                return {title:this.getTitle(this.props)}
            })
        }
    }
    getTitle = (props:Props) => {
        return (props.conversation && ConversationUtilities.getConversationTitle(props.conversation)) || ""
    }
    onTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        this.setState((prevState:State) => {
            return {title:value}
        })
    }
    onTitleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const oldTitle = this.getTitle(this.props)
        const conversationId = this.props.conversation && this.props.conversation.id
        if(conversationId && this.state.title != oldTitle)
        {
            ApiClient.updateConversation(conversationId,{title:this.state.title}, (data, status, error) => {
                ToastManager.showErrorToast(error, status, translate("Could not update conversation"))
            })
        }
    }
    getMemberOptionMenuItems = (profile:UserProfile) => () => {

        const conversation = this.props.conversation
        const items:OverflowMenuItem[] = []
        if(conversation.temporary)
            return items
        items.push({id:"1", type:OverflowMenuItemType.option, title:translate("common.page.profile"), onPress:() => window.app.navigateToRoute(profile.uri), toggleMenu:false})
        if(profile.id != this.props.authenticatedUser.id)
        {
            items.push({id:"2", type:OverflowMenuItemType.option, title:translate("conversation.message.user"), onPress:() => alert("not implemented")})
            if(conversation.users.length > 2)
                items.push({id:"3", type:OverflowMenuItemType.option, title:translate("conversation.user.remove"), onPress:() => NotificationCenter.push(ConversationActionRemoveUsersNotification,[{conversation:conversation.id, users:[profile.id]}]), toggleMenu:false})
        }
        return items
    }
    renderMember = (member:number) => {
        const conversation = this.props.conversation
        const profile = ProfileManager.getProfileById(member)
        return <ListItem key={profile.id || uniqueId()} className="d-flex align-items-center justify-content-between member-item">
                        <div className="d-flex align-items-center">
                            <Avatar userStatus={profile.id} className="mr-2" size={40} image={userAvatar(profile, true)} />
                            <div className="text-truncate">{userFullName(profile)}</div>
                        </div>
                        {!conversation.temporary && <DropDownMenu items={this.getMemberOptionMenuItems(profile)} triggerClass="fas fa-ellipsis-v action-button push-right" />}
                    </ListItem>
    }
    toggleAddMembersDialog = () => {
        this.setState((prevState:State) => {
            return {addMembersDialogVisible:!prevState.addMembersDialogVisible}
        })
    }
    renderAddMembers = () => {
        const canAddMembers = true
        if(!canAddMembers)
            return
        return <ListItem hasAction={true} onClick={this.toggleAddMembersDialog} className="d-flex align-items-center">
                    <div className="mr-2 d-flex align-items-center justify-content-center main-content-secondary-background" style={{width:40, height:40, borderRadius:"50%", background:"white", color:"black"}}>
                        <i style={{height:20}} className="fas fa-plus"></i>
                    </div>
                    <div className="text-truncate">{translate("conversation.add.members")}</div>
                </ListItem>
    }
    onDidAddMembers = (added:number[]) => {
        const conversationId = this.props.conversation.id
        this.setState((prevState:State) => {
            return {addMembersDialogVisible:false}
        }, () => {
            ApiClient.addConversationUsers(conversationId, added, (conversation, status, error) => {
                ToastManager.showErrorToast(error, status, translate("Could not add new members"))
            })
        })
    }
    onAddMembersUpdate = (added:number[]) => {
        this.setState((prevState:State) => {
            return {canSubmitNewMembers:added.length > 0}
        })
    }
    renderAddmembersDialog = () => {
        const visible = this.state.addMembersDialogVisible
        let contacts:UserProfile[] = []
        if(visible)
        {
            const conversation = this.props.conversation
            const possibleNewMembers = ProfileManager.getContactListIds(false).filter(u => !conversation.users.contains(u))
            contacts = ProfileManager.getProfiles(possibleNewMembers)
        }
        return <SelectUsersDialog 
                    contacts={contacts}
                    title={translate("conversation.add.members")}
                    visible={visible}
                    didCancel={this.toggleAddMembersDialog}
                    didSubmit={this.onDidAddMembers}
                    didUpdate={this.onAddMembersUpdate}
                    canSubmit={this.state.canSubmitNewMembers}
                    singleSelect={false}
                    />
    }
    renderMembers = () => {
        return this.props.conversation.users.map(this.renderMember)
    }
    getOptionMenuItems = () => {
        const conversation = this.props.conversation
        const items:OverflowMenuItem[] = []
        if(conversation.temporary)
            return items
        
        items.push({id:"1", type:OverflowMenuItemType.option, title:translate("common.rename"), onPress:() => this.titleRef && this.titleRef.current && this.titleRef.current.focus(), toggleMenu:false})
        const isArchived = (conversation.archived_by || []).contains(this.props.authenticatedUser.id)
        if(!isArchived)
            items.push({id:"3", type:OverflowMenuItemType.option, title:translate("conversation.menu.archive"), onPress:() => NotificationCenter.push(ConversationActionArchiveNotification,[{conversation:conversation.id}]), toggleMenu:false})
        
        const canLeaveConversation = conversation.users.length > 2
        if(!conversation.temporary && canLeaveConversation)
            items.push({id:"4", type:OverflowMenuItemType.option, title:translate("conversation.leave"), onPress:() => NotificationCenter.push(ConversationActionLeaveNotification,[{conversation:conversation.id}]), toggleMenu:false})
        
        return items
    }
    renderContent = () => {
        const {conversation, authenticatedUser} = this.props
        if(!conversation)
            return null
        const title = this.state.title
        return (
            <>
                <List enableAnimation={false} className="conversation-editor">
                    <div className="d-flex">
                        {ConversationUtilities.getAvatar(conversation, authenticatedUser.id, true)}
                        <InputGroup className="input-group-transparent">
                            <Input disabled={conversation.temporary} innerRef={this.titleRef} placeholder={translate("common.title")} tabIndex={1} className="form-control-transparent primary-text title-text" value={title} onChange={this.onTitleChange} onBlur={this.onTitleBlur} /> 
                        </InputGroup>
                        {!conversation.temporary && <DropDownMenu items={this.getOptionMenuItems()} triggerClass="fas fa-cog action-button push-right" />}
                    </div>
                    <ListHeader>{translate("conversation.members")}</ListHeader>
                    {!conversation.temporary && this.renderAddMembers()}
                    {this.renderMembers()}
                </List>
                {this.renderAddmembersDialog()}
            </>
        )
    }
    render()
    {
        const {history, match, location, staticContext, contextNaturalKey, conversation, createNewConversation, authenticatedUser, ...rest} = this.props
        const {breakpoint, className} = this.props
        const cn = classnames("conversation-details-module", className, {temporary:conversation && conversation.temporary})
        return (<SimpleModule {...rest}
                    className={cn}
                    breakpoint={breakpoint}
                    showHeader={false}
                    isLoading={false}>
                {this.renderContent()}
                </SimpleModule>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {

    const conversation = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.CONVERSATION) as Conversation || state.tempCache.conversation
    const authenticatedUser = AuthenticationManager.getAuthenticatedUser()
    const createNewConversation = ownProps.match.params.conversationId == tempConversationId
    return {
        conversation,
        authenticatedUser,
        createNewConversation
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ConversationDetailsModule))