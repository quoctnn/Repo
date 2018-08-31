import * as React from "react";
import * as moment from "moment-timezone";
import { MessagePosition } from './ChatMessage';
import { Message } from '../../reducers/conversationStore';
let timezone = moment.tz.guess()
require("./ChatMessageTime.scss");
export interface Props {
    data:Message,
    direction:MessagePosition,
}
export class ChatMessageTime extends React.Component<Props, {}> {
    shouldComponentUpdate(nextProps:Props, nextState) {
        return nextProps.direction != this.props.direction
    }
    render() {
        
        let time = moment(this.props.data.created_at).tz(timezone).format("LT");
        let msgClass = 'chat-time ' + this.props.direction
        return (
            <li className={msgClass}>
                <div className="chat-time-inner">
                    <span className="time">{time}</span>
                </div>
            </li>
        )
    }
}