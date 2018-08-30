import * as React from "react";
import * as moment from "moment-timezone";
import { Message } from '../../reducers/conversationStore';
import { userFullName, rawMarkup } from '../../utilities/Utilities';
require("./ChatMessage.scss");
let timezone = moment.tz.guess()

export enum MessagePosition
{
    LEFT = "left", RIGHT = "right"
}
export interface Props {
    data:Message,
    direction:MessagePosition,
    showUserName:boolean,
}
export class ChatMessage extends React.Component<Props, {}> {
    shouldComponentUpdate() {
        return false
    }
    render() {
        let msg = this.props.data
        let msgClass = 'chat-message ' + this.props.direction
        let time = moment(msg.created_at).tz(timezone).format("LT");

        return (
            <li className={msgClass}>
                {
                    this.props.showUserName &&
                    <span className="name"><b>{userFullName(msg.user)}</b></span>
                }
                <span className="body" dangerouslySetInnerHTML={rawMarkup(msg.text, [])}></span>
                <span className="time">{time}</span>
            </li>
        )
    }
}