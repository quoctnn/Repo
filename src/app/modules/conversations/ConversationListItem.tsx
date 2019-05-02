import * as React from 'react'
import classnames from "classnames"
import "./ConversationListItem.scss"
import { Conversation } from '../../types/intrasocial_types';
import { Link } from 'react-router-dom';
import { getConversationTitle } from '../../utilities/ConversationUtilities';
import { AuthenticationManager } from '../../managers/AuthenticationManager';

type OwnProps = {
    conversation:Conversation
}
type State = {
}
type Props = OwnProps & React.HTMLAttributes<HTMLElement>
export default class ConversationListItem extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {

        }
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        const ret =  nextProps.conversation != this.props.conversation
        return ret
    }
    render()
    {
        const {conversation, className, children, ...rest} = this.props
        const cl = classnames("conversation-list-item", className)
        return (<Link to={conversation.uri} {...rest} className={cl}>
                    {getConversationTitle( conversation, AuthenticationManager.getAuthenticatedUser().id)}
                </Link>)
    }
}