import * as React from "react";
import { MessagePosition } from './ChatMessage';
import UserProfileAvatar from "../../components/general/UserProfileAvatar";
import Avatar from "../../components/general/Avatar";

export interface Props {
    profileId?:number,
    avatar:string,
    text:string,
    direction:MessagePosition,
}
export class ChatMessageUser extends React.Component<Props, {}> {

    shouldComponentUpdate(nextProps:Props, nextState) {
        return nextProps.avatar != this.props.avatar ||
        nextProps.text != this.props.text ||
        nextProps.direction != this.props.direction
    }
    render() {
        let msgClass = 'chat-user ' + this.props.direction
        return (
            <div className={msgClass}>
                <div className="chat-user-inner">
                    {this.props.direction == MessagePosition.LEFT &&
                        <>
                            {this.props.profileId &&
                                <UserProfileAvatar size={24} profileId={this.props.profileId}/>
                                ||
                                <Avatar size={24} image={this.props.avatar}/>
                            }
                        </>
                    }
                    <span className="text text-truncate">{this.props.text}</span>
                </div>
            </div>
        )
    }
}