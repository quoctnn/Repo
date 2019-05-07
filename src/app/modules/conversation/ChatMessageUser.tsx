import * as React from "react";
import { MessagePosition } from './ChatMessage';
import { Avatar } from "../../components/general/Avatar";

export interface Props {
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
                    {this.props.direction == MessagePosition.LEFT && <Avatar image={this.props.avatar} size={24} />}
                    <span className="text text-truncate">{this.props.text}</span>
                </div>
            </div>
        )
    }
}