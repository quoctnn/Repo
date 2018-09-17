import { Avatar } from './Avatar';
import * as React from 'react';
import { Conversation } from '../../reducers/conversations';
import { Link } from 'react-router-dom';
import { Routes } from '../../utilities/Routes';
import { getProfileById } from '../../main/App';
import { OverflowList } from './OverflowList';
import { RootState } from '../../reducers';
import { connect } from 'react-redux'
import { UserProfile } from '../../reducers/profileStore';
import { getConversationTitle } from '../../utilities/ConversationUtilities';
require("./ConversationItem.scss");
export interface Props {
    conversation:Conversation,
    profile:UserProfile,
    children?: React.ReactNode,
    className?:string
    isActive:boolean

}
class ConversationItem extends React.Component<Props, {}> {
    static maxVisibleAvatars = 5
    constructor(props) {
        super(props);
    }
    shouldComponentUpdate(nextProps:Props, nextState) {
        return nextProps.isActive != this.props.isActive || nextProps.className != this.props.className || nextProps.conversation != this.props.conversation || nextProps.conversation.unread_messages.length != this.props.conversation.unread_messages.length || nextProps.profile != this.props.profile || this.props.children != nextProps.children
    }
    render() {
        let me = this.props.profile
        if(!me)
        {
            return null
        }
        let conversation = this.props.conversation
        let myId = this.props.profile.id
        let title = getConversationTitle(this.props.conversation, myId)
        let users = conversation.users.filter(i => i != myId)
        
        return (
            <div className={"conversation-item" + (this.props.isActive ? " active" : "") + (this.props.className ? " " + this.props.className:"") }>
                <Link to={Routes.CONVERSATION + conversation.id}>
                    <h6 className="title">
                        <span className="text-truncate">{title}</span>
                        {
                            conversation.unread_messages.length > 0 && 
                            <div className="notification-badge bg-success text-white">{conversation.unread_messages.length}</div>
                        }
                    </h6>
                    <div className="conversation-item-body d-flex">
                        <OverflowList count={conversation.users.length} size={26}>
                            {users.slice(0, ConversationItem.maxVisibleAvatars).map((uid, index) => {
                                let p = getProfileById(uid)
                                let avatar = (p && p.avatar) || null
                                return <li key={index}><Avatar image={avatar} size={26} borderColor="white" borderWidth={2}  /></li>
                            })}
                        </OverflowList>
                        <div className="flex-grow"></div>
                        {this.props.children}
                    </div>
                </Link>
            </div>
        )
    }
}
const mapStateToProps = (state:RootState) => {
    return {
        profile:state.profile
    };
}
export default connect(mapStateToProps, null)(ConversationItem);