import * as React from 'react';
import classNames from "classnames";
import ActionTrigger from '../ActionTrigger';
import {  Popover, PopoverBody } from 'reactstrap';
import { nullOrUndefined } from '../../../utilities/Utilities';
require("./ReactButton.scss");

export enum StatusReaction
{
    LIKE = "like",
    HEART = "heart",
    SAD = "sad",
    JOY = "joy"
}
export namespace StatusReaction {
    export const classNameForReaction = (reaction:StatusReaction, large = true, showBackground:boolean) => 
    {
        var ret = "far emoji-reaction " + reaction + (showBackground ? " fa-stack-1x fa-inverse" : "")
        switch (reaction)
        {
            case StatusReaction.SAD : ret += " fa-sad-tear";break;
            case StatusReaction.JOY : ret += " fa-grin-tears";break;
            case StatusReaction.HEART : ret += " fa-grin-hearts";break;
            case StatusReaction.LIKE : ret += " fa-thumbs-up";break;
        }
        ret += (large ? " large": "")
        return ret
    }
    export const classNameForReactionContainer = (reaction:StatusReaction, large = true, showBackground:boolean) => 
    {
        return "emoji-reaction-container" + (large ? " large fa-2x": "") + (showBackground ? " fa-stack-1-5" : "" )
    }
    export const classNameForReactionBackground = (reaction:StatusReaction, large = true) => 
    {
        return "fas fa-circle fa-stack-1-5x emoji-reaction-bg " + reaction
    }
    export const parseStatusReaction = (reaction:string):StatusReaction => 
    {
        switch (reaction)
        {
            case StatusReaction.JOY : return StatusReaction.JOY
            case StatusReaction.HEART : return StatusReaction.HEART
            case StatusReaction.SAD : return StatusReaction.SAD
            default : return StatusReaction.LIKE
        }
    }
    export const reactionsList = ():StatusReaction[] => 
    {
        var arr = []
        for(var n in StatusReaction) {
            if (typeof StatusReaction[n] === 'string') 
            {
                arr.push(StatusReaction[n]);
            }
        }
        return arr
    }
    export const Component = (props:StatusReactionProps) => 
    {
        let showBG = nullOrUndefined (props.showBackground ) ? true : props.showBackground
        return (<span onClick={props.onClick} className={classNameForReactionContainer(props.reaction, props.large, showBG)}>
                    {showBG && <i className={classNameForReactionBackground(props.reaction, props.large)}></i>}
                    <i className={classNameForReaction(props.reaction, props.large, showBG)}></i>
                </span>)
    }
}

export interface Props 
{
    reaction:string
    onReact:(reaction:string) => void
}
interface State 
{
    reactionsOpen:boolean
}
export interface StatusReactionProps
{
    reaction:StatusReaction
    onClick?:() => void
    large?:boolean
    showBackground?:boolean
}

export default class ReactButton extends React.Component<Props, State> 
{     
    ref = React.createRef<any>();
    containerRef = React.createRef<any>();
    popoverContainerRef = React.createRef<any>();
    constructor(props:Props)
    {
        super(props)
        this.state = {
            reactionsOpen:false
        }
        this.toggleReaction = this.toggleReaction.bind(this)
    }
    shouldComponentUpdate(nextProps:Props, nextState:State) {
        return nextProps.reaction != this.props.reaction || this.state.reactionsOpen != nextState.reactionsOpen 
    }
    toggleReaction(event?:any)
    {
        if(event)
            event.preventDefault()
        let reaction = this.props.reaction == null ? "like" : null
        this.props.onReact(reaction)
    }
    toggleReactionsView = () => 
    {
        this.setState(prevState => ({
            reactionsOpen: !prevState.reactionsOpen
          }))
    }
    onReact = (reaction, event) => 
    {
        event.preventDefault()
        this.hideReactionsView()
        if(this.props.reaction != reaction)
        {
            this.props.onReact(reaction)
        }
    }
    renderReactions = () => {
        let list = StatusReaction.reactionsList()
        let items = list.map((item, index) => {
            return (<StatusReaction.Component key={item} reaction={item} onClick={this.onReact.bind(this, item)}></StatusReaction.Component>)
        })
        return items
    }
    renderReactionsView = () => 
    {
        if (!this.state.reactionsOpen)
        {
            return null
        }
        return <Popover placement="top" hideArrow={true} isOpen={this.state.reactionsOpen} target={this.ref.current} container={this.popoverContainerRef.current} toggle={this.toggleReactionsView}>
                    <PopoverBody>{this.renderReactions()}</PopoverBody>
                </Popover>
    }
    showReactionsView = () => 
    {
        this.setState({ reactionsOpen:true })
    }
    hideReactionsView = () => 
    {
        this.setState({ reactionsOpen:false })
    }
    render() {
        let classes = classNames("btn btn-like", {"active": this.props.reaction != null})
        const reaction = StatusReaction.parseStatusReaction(this.props.reaction)
        const showBG = reaction != StatusReaction.LIKE
        return (
            <>
                <span ref={this.popoverContainerRef}>
                    {this.renderReactionsView()}
                </span>
                <ActionTrigger isActive={this.state.reactionsOpen} clickTarget={this.ref} onPress={this.toggleReaction} targetRef={this.containerRef} otherTargetRef={this.popoverContainerRef} time={500} onAction={this.showReactionsView} onActionEnd={this.hideReactionsView}>
                    <span className="container" ref={this.containerRef}>
                        <button ref={this.ref} className={classes}>
                            <StatusReaction.Component showBackground={showBG} large={false} reaction={reaction}></StatusReaction.Component>
                        </button>
                    </span>
                </ActionTrigger>
            </>
        );
    }
}