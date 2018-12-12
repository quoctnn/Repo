import { Avatar } from './Avatar';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Routes from '../../utilities/Routes';
import { OverflowList } from './OverflowList';
import { RootState } from '../../reducers';
import { connect } from 'react-redux'
import { getConversationTitle } from '../../utilities/ConversationUtilities';
import { ProfileManager } from '../../managers/ProfileManager';
import { Conversation, UserProfile } from '../../types/intrasocial_types';
import { nullOrUndefined } from '../../utilities/Utilities';
require("./ConversationItem.scss");
export interface OwnProps {
    conversation:Conversation
    children?: React.ReactNode
    className?:string
    isActive:boolean
}
interface ReduxStateProps 
{
    authenticatedProfile:UserProfile
}
interface State 
{
}
type Props = ReduxStateProps & OwnProps
class ConversationItem extends React.Component<Props, State> {
    static maxVisibleAvatars = 5
    constructor(props) {
        super(props);
    }
    shouldComponentUpdate(nextProps:Props, nextState) {
        return nextProps.isActive != this.props.isActive || nextProps.className != this.props.className || nextProps.conversation != this.props.conversation || nextProps.conversation.unread_messages.length != this.props.conversation.unread_messages.length || nextProps.authenticatedProfile != this.props.authenticatedProfile || this.props.children != nextProps.children
    }
    render() {
        let me = this.props.authenticatedProfile
        if(!me)
        {
            return null
        }
        let conversation = this.props.conversation
        let myId = this.props.authenticatedProfile.id
        let title = getConversationTitle(this.props.conversation, myId)
        let users = ProfileManager.getProfiles(conversation.users.filter(i => i != myId).slice(0, ConversationItem.maxVisibleAvatars))
        const avatars = users.map(u => u.avatar_thumbnail || u.avatar).filter(a => !nullOrUndefined(a))
        const size = 44
        const padding = 10
        return (
            <div className={"conversation-item" + (this.props.isActive ? " active" : "") + (this.props.className ? " " + this.props.className:"") }>
                <Link className="d-flex" to={Routes.conversationUrl(conversation.id)}>
                    <div className="conversation-item-body d-flex align-items-center" style={{height:(size + padding * 2)  + "px", padding:padding + "px"}}>
                        <div>
                            <Avatar images={avatars} size={size} borderColor="white" borderWidth={2}>
                                
                            </Avatar>
                        </div>
                        <div className="text-truncate flex-column">
                            <span className="text-truncate">
                                <span className="title text-truncate">{title}</span>
                                {
                                    conversation.unread_messages.length > 0 && 
                                    <div className="notification-badge bg-success text-white"><span>{conversation.unread_messages.length}</span></div>
                                }
                            </span>
                            {this.props.children}
                        </div>
                        
                    </div>
                </Link>
            </div>
        )
    }
}

const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {
    return {
        authenticatedProfile:state.auth.profile
    }
}
export default connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(ConversationItem);