import * as React from "react";
import { Message } from "../../types/intrasocial_types";
import { MessageContent } from './MessageContent';
import classnames = require("classnames");

export enum MessagePosition
{
    LEFT = "left", RIGHT = "right"
}
type Props = {
    data:Message,
    direction:MessagePosition,
}
export class ChatMessage extends React.Component<Props, {}> {
    shouldComponentUpdate = (nextProps:Props, nextState) => {
        if(nextProps.data.error != this.props.data.error)
        {
            return true
        }
        let n = nextProps.data.tempFile
        let o = this.props.data.tempFile
        if((n && !o ) || !n && o)
            return true
        if(!n && !o)
            return false
        return n.progress != o.progress || n.error != o.error 
    }
    render() {
        const message = this.props.data
        const cl = classnames("chat-message", this.props.direction + (message.pending ? " temp" : ""), {"temp":message.pending})
        return (
            <div className={cl}>
                <MessageContent message={message} simpleMode={false} />
            </div>
        )
    }
}