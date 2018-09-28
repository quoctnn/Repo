import * as React from 'react';
import classNames from "classnames";
require("./ReactButton.scss");

export interface Props 
{
    reaction:string
    onReact:(reaction:string) => void
}
interface State 
{
}
export default class ReactButton extends React.Component<Props, State> 
{     
    constructor(props:Props)
    {
        super(props)
        this.toggleReaction = this.toggleReaction.bind(this)
    }
    shouldComponentUpdate(nextProps:Props, nextState) {
        return nextProps.reaction != this.props.reaction
    }
    toggleReaction(event)
    {
        event.preventDefault()
        let reaction = this.props.reaction == null ? "like" : null
        this.props.onReact(reaction)
    }
    render() {
        let classes = classNames("btn-like", {"active": this.props.reaction != null})
        return (
            <span className={classes} onClick={this.toggleReaction}>
                <i className="fas fa-thumbs-up"></i>
            </span>
        );
    }
}