import * as React from 'react'
import classnames from "classnames"
import "./ConversationListItem.scss"
import { Conversation, UserProfile } from '../../types/intrasocial_types';
import { Link } from 'react-router-dom';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { ProfileManager } from '../../managers/ProfileManager';
import { ReduxState } from '../../redux';
import { connect } from 'react-redux';
import { ConversationUtilities } from '../../utilities/ConversationUtilities';
import { DropDownMenu } from '../../components/general/DropDownMenu';
import { OverflowMenuItem, OverflowMenuItemType } from '../../components/general/OverflowMenu';
import { translate } from '../../localization/AutoIntlProvider';
import { MessageContent } from '../conversation/MessageContent';
import { ConversationManager } from '../../managers/ConversationManager';
import { NotificationCenter } from '../../utilities/NotificationCenter';
import { ConversationActionArchiveNotification, ConversationActionArgument } from './ConversationsModule';
import { TimeComponent } from '../../components/general/TimeComponent';
export enum ConversationAction{
    delete = "delete",
    archive = "archive",
    leave = "leave",
    removeUsers = "remove.users"
}
type OwnProps = {
    conversation:Conversation
    children?: React.ReactNode
    className?:string
    isActive:boolean
    onConversationAction?:(action:ConversationAction, argument:ConversationActionArgument) => void
}
type ReduxStateProps =
{
    authenticatedProfile:UserProfile,
    queueLength:number
}
type State = {
    optionsMenuVisible:boolean
}
type Props = OwnProps & React.HTMLAttributes<HTMLElement> & ReduxStateProps
class ConversationListItem extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            optionsMenuVisible:false
        }
    }
    shouldComponentUpdate(nextProps:Props, nextState:State) {
        return nextProps.isActive != this.props.isActive ||
        nextProps.className != this.props.className ||
        nextState.optionsMenuVisible != this.state.optionsMenuVisible ||
        nextProps.conversation != this.props.conversation ||
        nextProps.conversation.unread_messages.length != this.props.conversation.unread_messages.length ||
        this.props.children != nextProps.children ||
        this.props.queueLength != nextProps.queueLength
    }
    onConversationAction = (action:ConversationAction, conversationId:number) => (e:React.SyntheticEvent) => {
        e.preventDefault()
        this.props.onConversationAction && this.props.onConversationAction(action, {conversation:conversationId})
    }
    toggleDropDown = (e:React.SyntheticEvent) => {
        e.preventDefault()
        e.stopPropagation()
        this.setState((prevState:State) => {
            return {optionsMenuVisible:!prevState.optionsMenuVisible}
        })
    }
    renderOptionsMenu = () => {
        if(this.state.optionsMenuVisible)
            return <div>Test</div>
        return null
    }
    getOptionMenuItems = () => {
        const conversation = this.props.conversation
        const items:OverflowMenuItem[] = []
        if(conversation.temporary)
            return items
        const isArchived = (conversation.archived_by || []).contains(this.props.authenticatedProfile.id)
        if(!isArchived)
            items.push({id:"3", type:OverflowMenuItemType.option, title:translate("conversation.menu.archive"), onPress:() => NotificationCenter.push(ConversationActionArchiveNotification,[{conversation:conversation.id}]), toggleMenu:false})
        return items
    }
    render() {

        const {conversation, className, authenticatedProfile, isActive, children, queueLength, ...rest} = this.props
        if(!authenticatedProfile)
        {
            return null
        }
        let myId = authenticatedProfile.id
        ProfileManager.ensureProfilesExists(conversation.users, () => {})
        let title = ConversationUtilities.getConversationTitle(this.props.conversation, myId)
        const cl = classnames("conversation-list-item", className, {active:isActive})
        const ddOptions = this.getOptionMenuItems()
        const hasUnsentMessages = queueLength > 0
        return (
            <div className={cl}>
                <Link className="d-flex button-link" to={conversation.uri || "#"}>
                    <div className="conversation-item-body d-flex align-items-center">
                        <div>
                            {ConversationUtilities.getAvatar(conversation, myId, true, this.props.children)}
                        </div>
                        <div className="d-flex flex-column text-truncate right-content">
                            <div className="title-row d-flex">
                                <div className="title text-truncate">
                                {hasUnsentMessages && <i className="fas fa-exclamation-triangle small-text text-danger mr-1"></i>}
                                {title}
                                </div>
                                {conversation.last_message && <TimeComponent date={conversation.last_message.created_at} />}
                            </div>
                            <div className="subtitle-row d-flex">
                                {conversation.last_message && <div className="text-truncate">
                                    <MessageContent message={conversation.last_message} simpleMode={true}/>
                                </div>}
                                {conversation.temporary &&
                                    <i onClick={this.onConversationAction(ConversationAction.delete, conversation.id)} className="fas fa-times action-button push-right"></i>
                                    || ddOptions.length > 0 &&
                                    <DropDownMenu items={ddOptions} triggerClass="fas fa-cog action-button push-right" />
                                }
                            </div>
                        </div>
                    </div>
                </Link>
                {this.renderOptionsMenu()}
            </div>
        )
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {


    let queueLength = 0
    if(ownProps.conversation)
        queueLength = ConversationManager.getQueuedMessages(ownProps.conversation.id, true).length
    return {
        authenticatedProfile:AuthenticationManager.getAuthenticatedUser(),
        queueLength
    }
}
export default connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(ConversationListItem);