import * as React from 'react';
import classNames from "classnames";
import ActionTrigger from '../ActionTrigger';
import {  Popover, PopoverBody } from 'reactstrap';
import { StatusReaction, StatusReactionUtilities } from '../../../types/intrasocial_types';
import { StatusActions } from './StatusComponent';
require("./ReactButton.scss");


export interface Props 
{
    reaction:string
    onReact:(action:StatusActions, extra?:Object) => void
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
        this.props.onReact(StatusActions.react, {reaction} )
    }
    toggleReactionsView = () => 
    {
        this.setState(prevState => ({
            reactionsOpen: !prevState.reactionsOpen
          }))
    }
    onReact = (reaction:string|null) => (event) => 
    {
        event.preventDefault()
        this.hideReactionsView()
        if(this.props.reaction != reaction)
        {
            this.props.onReact(StatusActions.react, {reaction} )
        }
    }
    renderReactions = () => {
        let list = StatusReactionUtilities.reactionsList()
        
        let items = list.map((item, index) => {
            return (<StatusReactionUtilities.Component selected={true} large={true} key={item} reaction={item} onClick={this.onReact(item)}></StatusReactionUtilities.Component>)
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
        const active = this.props.reaction != null
        let classes = classNames("btn btn-like", {"active": active})
        const reaction = StatusReactionUtilities.parseStatusReaction(this.props.reaction)
        const showBG = reaction != StatusReaction.LIKE
        return (
            <>
                <span ref={this.popoverContainerRef}>
                    {this.renderReactionsView()}
                </span>
                <ActionTrigger isActive={this.state.reactionsOpen} clickTarget={this.ref} onPress={this.toggleReaction} targetRef={this.containerRef} otherTargetRef={this.popoverContainerRef} time={500} onAction={this.showReactionsView} onActionEnd={this.hideReactionsView}>
                    <span className="container" ref={this.containerRef}>
                        <button ref={this.ref} className={classes}>
                            <StatusReactionUtilities.Component selected={active} showBackground={showBG} large={false} reaction={reaction}></StatusReactionUtilities.Component>
                        </button>
                    </span>
                </ActionTrigger>
            </>
        );
    }
}