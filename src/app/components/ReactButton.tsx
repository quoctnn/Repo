import * as React from 'react';
import classNames from "classnames";
import {  Popover, PopoverBody } from 'reactstrap';
import { StatusActions, StatusReaction, StatusReactionUtilities } from '../types/intrasocial_types';
import ActionTrigger from './ActionTrigger';
import HoverLongPressTrigger from './HoverLongPressTrigger';
require("./ReactButton.scss");


export interface Props 
{
    reaction:string
    onActionPress:(action:StatusActions, extra?:Object) => void
}
interface State 
{
    reactionsOpen:boolean
    popoverOpen:boolean
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
            reactionsOpen:false,
            popoverOpen:false
        }
        this.toggleReaction = this.toggleReaction.bind(this)
    }
    shouldComponentUpdate(nextProps:Props, nextState:State) {
        return nextProps.reaction != this.props.reaction || this.state.reactionsOpen != nextState.reactionsOpen || this.state.popoverOpen != nextState.popoverOpen
    }
    toggleReaction(event?:any)
    {
        console.log("toggleReaction")
        if(event)
            event.preventDefault()
        let reaction = this.props.reaction == null ? "like" : null
        this.props.onActionPress(StatusActions.react, {reaction} )
    }
    onReact = (reaction:string|null) =>
    {
        this.hideReactionsView()
        if(this.props.reaction != reaction)
        {
            this.props.onActionPress(StatusActions.react, {reaction} )
        }
    }
    renderReactions = () => {
        let list = StatusReactionUtilities.reactionsList()
        
        let items = list.map((item, index) => {
            return (<StatusReactionUtilities.Component selected={true} large={true} key={item} reaction={item} onClick={(event) => {event.preventDefault(); this.onReact(item);}}></StatusReactionUtilities.Component>)
        })
        return items
    }
    hideReactionsView = () => 
    {
        this.setState({ reactionsOpen:false, popoverOpen:false })
    }
    onPopoverHover = () => {

        console.log("onPopoverHover")
        this.setState({ popoverOpen:true })
    }
    onPopoverHoverOut = () => {
        
        console.log("onPopoverHoverOut")
        this.setState({ popoverOpen:false })
    }
    onReactionButtonHover = () => {

        this.setState({ reactionsOpen:true })
    }
    onReactionButtonHoverOut = () => {
        
        this.setState({ reactionsOpen:false })
    }
    renderReactionsView = () => 
    {
        const open = this.state.reactionsOpen || this.state.popoverOpen
        if (!open)
        {
            return null
        }
        return <Popover placement="top" hideArrow={false} isOpen={open} target={this.ref.current} container={this.popoverContainerRef.current} toggle={this.hideReactionsView}>
                    <PopoverBody>
                        <HoverLongPressTrigger className="trigger reactions-panel"
                            onHover={this.onPopoverHover} 
                            onHoverOut={this.onPopoverHoverOut} 
                            onLongPress={() => {}}>
                        {this.renderReactions()}
                        </HoverLongPressTrigger>
                    </PopoverBody>
                </Popover>
    }
    render() {
        const active = this.props.reaction != null
        let classes = classNames("btn btn-like", {"active": active})
        const reaction = StatusReactionUtilities.parseStatusReaction(this.props.reaction)
        const showBG = reaction != StatusReaction.LIKE
        console.log("asd", this.state.popoverOpen, this.state.reactionsOpen)
        return (
            <>
                <span ref={this.popoverContainerRef}>
                    {this.renderReactionsView()}
                </span>
                <HoverLongPressTrigger onClick={this.toggleReaction} style={{display:"inline-block"}} onHover={this.onReactionButtonHover} onHoverOut={this.onReactionButtonHoverOut} onLongPress={this.onReactionButtonHover}>
                    <span className="" ref={this.containerRef}>
                        <button ref={this.ref} className={classes}>
                            <StatusReactionUtilities.Component selected={active} showBackground={showBG} large={false} reaction={reaction}></StatusReactionUtilities.Component>
                        </button>
                    </span>
                </HoverLongPressTrigger>
            </>
        );
    }
}