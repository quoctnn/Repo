import * as React from "react";
import { Input, InputGroupAddon, Button } from 'reactstrap';
import InputGroup from "reactstrap/lib/InputGroup";
import { ReduxState } from "../../redux";
import { Conversation, UserProfile } from '../../types/intrasocial_types';
import { connect } from "react-redux";
import { ConversationUtilities } from "../../utilities/ConversationUtilities";
import { ConversationManager } from '../../managers/ConversationManager';
import { translate } from "../../localization/AutoIntlProvider";
import { Avatar } from "../../components/general/Avatar";
import { ProfileManager } from '../../managers/ProfileManager';
import { userAvatar, uniqueId, userFullName } from '../../utilities/Utilities';
import { List, ListHeader, ListItem } from '../../components/general/List';
import { AuthenticationManager } from "../../managers/AuthenticationManager";
import ApiClient from "../../network/ApiClient";

type OwnProps = {
    conversationId:number
}
type State = {
    title:string
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
            title:this.getTitle(props)
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
            ConversationManager.updateConversation(this.props.conversationId, {title:this.state.title}, () => {

            })
        }
    }
    leaveConversation = () => {
        ApiClient.leaveConversation(this.props.conversation.id, (data, status, error) => {
            console.log(data,status, error  )
        })
    }
    renderMember = (member:number) => {
        const profile = ProfileManager.getProfileById(member)
        return <ListItem tabIndex={1} key={profile.id || uniqueId()} className="d-flex align-items-center">
                    <Avatar className="mr-2" size={40} image={userAvatar(profile, true)} />
                    <div className="text-truncate">{userFullName(profile)}</div>
                </ListItem>
    }
    renderMembers = () => {
        return this.props.conversation.users.map(this.renderMember)
    }
    render() {
        const {conversation} = this.props
        const title = this.state.title
        const canLeaveConversation = conversation.users.length > 2
        return (
            <List enableAnimation={false} className="conversation-editor">
                <InputGroup className="input-group-transparent">
                    <Input placeholder={translate("common.title")} tabIndex={1} className="text-center form-control-transparent primary-text title-text" value={title} onChange={this.onTitleChange} onBlur={this.onTitleBlur} /> 
                    <InputGroupAddon addonType="append">
                        <i className="fas fa-pen"></i>
                    </InputGroupAddon>
                </InputGroup>
                <ListHeader>{translate("conversation.members")}</ListHeader>
                {this.renderMembers()}
                <ListHeader>{translate("conversation.settings")}</ListHeader>
                {canLeaveConversation && <ListItem onClick={this.leaveConversation} className="d-flex text-danger">
                    {translate("conversation.leave")}
                </ListItem>  
                }
            </List>
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