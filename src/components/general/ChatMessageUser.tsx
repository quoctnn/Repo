import * as React from "react";
import { UserProfile } from '../../reducers/profileStore';
import { MessagePosition } from './ChatMessage';
import { Avatar } from './Avatar';
require("./ChatMessageUser.scss");
export interface Props {
    user:UserProfile,
    direction:MessagePosition,
}
export class ChatMessageUser extends React.Component<Props, {}> {
    shouldComponentUpdate(nextProps:Props, nextState) {
        return false
    }
    render() {
        let user = this.props.user
        let msgClass = 'chat-user ' + this.props.direction
        return (
            <li className={msgClass}>
                <div className="chat-user-inner">
                    <Avatar image={user.avatar} size={24} />
                    <span className="name text-truncate"><b>{user.first_name}</b></span>
                </div>
            </li>
        )
    }
}