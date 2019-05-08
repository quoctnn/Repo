import * as React from 'react'
import classnames from "classnames"
import "./ConversationListItem.scss"
import { Conversation, UserProfile } from '../../types/intrasocial_types';
import { Link } from 'react-router-dom';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import { ProfileManager } from '../../managers/ProfileManager';
import { nullOrUndefined } from '../../utilities/Utilities';
import Routes from '../../utilities/Routes';
import { Avatar } from '../../components/general/Avatar';
import { ReduxState } from '../../redux';
import { connect } from 'react-redux';
import { ConversationUtilities } from '../../utilities/ConversationUtilities';

type OwnProps = {
    conversation:Conversation
    children?: React.ReactNode
    className?:string
    isActive:boolean
}
type ReduxStateProps = 
{
    authenticatedProfile:UserProfile
}
type State = {
}
type Props = OwnProps & React.HTMLAttributes<HTMLElement> & ReduxStateProps
class ConversationListItem extends React.Component<Props, State> {
    static maxVisibleAvatars = 5
    constructor(props:Props) {
        super(props);
        this.state = {

        }
    }
    shouldComponentUpdate(nextProps:Props, nextState) {
        return nextProps.isActive != this.props.isActive || 
        nextProps.className != this.props.className || 
        nextProps.conversation != this.props.conversation || 
        nextProps.conversation.unread_messages.length != this.props.conversation.unread_messages.length || 
        this.props.children != nextProps.children
    }
    render() {

        const {conversation, className, authenticatedProfile, isActive, children, ...rest} = this.props
        if(!authenticatedProfile)
        {
            return null
        }
        let myId = authenticatedProfile.id
        let title = ConversationUtilities.getConversationTitle(this.props.conversation, myId)
        let users = ProfileManager.getProfiles(conversation.users.filter(i => i != myId).slice(0, ConversationListItem.maxVisibleAvatars))
        const avatars = users.map(u => u.avatar_thumbnail || u.avatar).filter(a => !nullOrUndefined(a))
        const size = 44
        const cl = classnames("conversation-list-item", className, {active:isActive})
        return (
            <div className={cl}>
                <Link className="d-flex button-link" to={conversation.uri || "#"}>
                    <div className="conversation-item-body d-flex align-items-center">
                        <div>
                            <Avatar images={avatars} size={size} borderColor="white" borderWidth={2}>
                                
                            </Avatar>
                        </div>
                        <div className="text-truncate flex-column">
                            <div className="text-truncate d-flex">
                                <div className="title text-truncate">{this.props.children ? this.props.children :title}</div>
                                {
                                    conversation.unread_messages.length > 0 && 
                                    <div className="notification-badge bg-success text-white"><span>{conversation.unread_messages.length}</span></div>
                                }
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        )
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
    return {
        authenticatedProfile:AuthenticationManager.getAuthenticatedUser()
    }
}
export default connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(ConversationListItem);