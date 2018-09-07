import { Avatar } from './Avatar';
import * as React from 'react';
import { Conversation } from '../../reducers/conversationStore';
import { Link } from 'react-router-dom';
import { Routes } from '../../utilities/Routes';
import { getProfileById } from '../../main/App';
import { OverflowList } from './OverflowList';
import { RootReducer } from '../../reducers';
import { connect } from 'react-redux'
import { UserProfile } from '../../reducers/profileStore';
import { getConversationTitle } from '../../utilities/ConversationUtilities';
require("./ConversationItem.scss");
export interface Props {
    conversation:Conversation,
    profile:UserProfile
}
class ConversationItem extends React.Component<Props, {}> {
    static maxVisibleAvatars = 5
    constructor(props) {
        super(props);
    }
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.profile != this.props.profile || this.props.children != nextProps.children
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
            <li className="conversation-item">
                <Link to={Routes.CONVERSATION + conversation.id}>
                    <h6 className="title text-truncate">{title}</h6>
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
                
            </li>
        )
    }
}
const mapStateToProps = (state:RootReducer) => {
    return {
        profile:state.profile
    };
}
export default connect(mapStateToProps, null)(ConversationItem);