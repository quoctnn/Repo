import * as React from "react";
import { Input, InputGroupAddon } from 'reactstrap';
import InputGroup from "reactstrap/lib/InputGroup";
import { ReduxState } from "../../redux";
import { Conversation, UserProfile } from '../../types/intrasocial_types';
import { connect } from "react-redux";
import { ConversationUtilities } from "../../utilities/ConversationUtilities";
import { translate, lazyTranslate } from "../../localization/AutoIntlProvider";
import Avatar from "../../components/general/Avatar";
import { ProfileManager } from '../../managers/ProfileManager';
import { userAvatar, uniqueId, userFullName } from '../../utilities/Utilities';
import { List, ListHeader, ListItem } from '../../components/general/List';
import { AuthenticationManager } from "../../managers/AuthenticationManager";
import {ApiClient} from "../../network/ApiClient";
import SelectUsersDialog from "../../components/general/dialogs/SelectUsersDialog";
import { ToastManager } from '../../managers/ToastManager';
import { ConversationManager } from '../../managers/ConversationManager';

type OwnProps = {
    conversationId:number
}
type State = {
    title:string
    addMembersDialogVisible:boolean
    canSubmitNewMembers:boolean
}
type ReduxStateProps = {
    conversation: Conversation
    authenticatedUser:UserProfile
}
type Props = OwnProps & ReduxStateProps
class ConversationEditor extends React.Component<Props, State> {
    
    constructor(props:Props){
        super(props)
        this.state = {
            title:this.getTitle(props),
            addMembersDialogVisible:false,
            canSubmitNewMembers:false
        }
    }
    
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        if(prevProps.conversation.updated_at != this.props.conversation.updated_at)
        {
            this.setState((prevState) => {
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
        if(this.state.title != oldTitle)
        {
            ApiClient.updateConversation(this.props.conversationId,{title:this.state.title}, (data, status, error) => {
                ToastManager.showRequestErrorToast(error, lazyTranslate("Could not update conversation"))
            })
        }
    }
    leaveConversation = () => {
        const conversation = this.props.conversation
        ConversationManager.leaveConversation(conversation.id, (success) => {
        })
    }
    renderMember = (member:number) => {
        const profile = ProfileManager.getProfileById(member)
        return <ListItem tabIndex={1} key={profile.id || uniqueId()} className="d-flex align-items-center">
                    <Avatar className="mr-2" size={40} image={userAvatar(profile, true)} />
                    <div className="text-truncate">{userFullName(profile)}</div>
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
        return <ListItem hasAction={true} onClick={this.toggleAddMembersDialog} tabIndex={1} className="d-flex align-items-center">
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
                ToastManager.showRequestErrorToast(error, lazyTranslate("Could not add new members"))
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
    render() {
        const {conversation} = this.props
        const title = this.state.title
        const canLeaveConversation = conversation.users.length > 2
        return (
            <>
                <List enableAnimation={false} className="conversation-editor">
                    <InputGroup className="input-group-transparent">
                        <Input placeholder={translate("common.title")} tabIndex={1} className="text-center form-control-transparent primary-text title-text" value={title} onChange={this.onTitleChange} onBlur={this.onTitleBlur} /> 
                        <InputGroupAddon addonType="append">
                            <i className="fas fa-pen"></i>
                        </InputGroupAddon>
                    </InputGroup>
                    <ListHeader>{translate("conversation.members")}</ListHeader>
                    {this.renderAddMembers()}
                    {this.renderMembers()}
                    <ListHeader>{translate("conversation.settings")}</ListHeader>
                    {canLeaveConversation && 
                        <ListItem hasAction={true} onClick={this.leaveConversation} className="d-flex text-danger">
                        {translate("conversation.leave")}
                        </ListItem>  
                    }
                </List>
                {this.renderAddmembersDialog()}
            </>
        )
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
    return {
        conversation:state.conversationStore.byId[ownProps.conversationId],
        authenticatedUser: AuthenticationManager.getAuthenticatedUser()
    }
}
export default connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(ConversationEditor);