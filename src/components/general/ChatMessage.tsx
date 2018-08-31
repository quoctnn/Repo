import * as React from "react";
import { Message } from '../../reducers/conversationStore';
import { rawMarkup } from '../../utilities/Utilities';
require("./ChatMessage.scss");

export enum MessagePosition
{
    LEFT = "left", RIGHT = "right"
}
export interface Props {
    data:Message,
    direction:MessagePosition,
}
export class ChatMessage extends React.Component<Props, {}> {
    shouldComponentUpdate(nextProps:Props, nextState) {
        return false
    }
    render() {
        let msg = this.props.data
        let msgClass = 'chat-message ' + this.props.direction
        return (
            <li className={msgClass}>
                <span className="body" dangerouslySetInnerHTML={rawMarkup(msg.text, [])}></span>
            </li>
        )
    }
}