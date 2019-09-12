import * as React from 'react';
import { Popover, PopoverBody, Button } from 'reactstrap';
import classnames = require('classnames');
import { OverflowMenuItem, createDropdownItem } from './OverflowMenu';
import "./DropDownMenu.scss"
import Popper from 'popper.js';
type Props = {
    items:(() => OverflowMenuItem[]) | OverflowMenuItem[]
    className?:string
    triggerClass:string
    triggerTitle?:string
    triggerIcon?:string
    modifiers?:any
}
type DefaultProps = {

}
type State = {
    popoverRemoved:boolean
    popoverVisible:boolean
}
export class DropDownMenu extends React.Component<Props, State> {
    private triggerRef = React.createRef<any>()
    static defaultProps:DefaultProps = {
    }
    constructor(props:Props) {
        super(props);
        this.state = {
            popoverRemoved:true,
            popoverVisible:false
        }
    }
    componentWillUnmount = () => {
        this.triggerRef = null
    }
    onTriggerClick = (e:React.SyntheticEvent) => {
        e.preventDefault()
        if(!this.state.popoverRemoved)
        {
            this.closePopoverPanel()
        }
        else {
            this.setState( (prevState) => {
                return {popoverRemoved:false, popoverVisible:true}
            })
        }
    }
    closePopoverPanel = () => {
        const completion = () => {
            setTimeout(() => {
                this.setState( (prevState) => {
                    return {popoverVisible:false, popoverRemoved:true}
                })
            }, 300)
        }
        this.setState( (prevState) => {
            return {popoverVisible:false}
        },completion)
    }
    renderPopover = () =>
    {
        const open = !this.state.popoverRemoved || this.state.popoverVisible
        if(!open)
            return null
        const items =  Array.isArray(this.props.items) ? this.props.items : this.props.items()
        const cn = classnames("dropdown-menu-popover", this.props.className)
        const modifiers:Popper.Modifiers = Object.assign({flip: { behavior: ['bottom', 'top', 'bottom'] } }, this.props.modifiers || {})
        return <Popover className={cn}
                        delay={0} 
                        trigger="legacy" 
                        placement="bottom" 
                        hideArrow={false} 
                        isOpen={this.state.popoverVisible} 
                        target={this.triggerRef.current} 
                        toggle={this.closePopoverPanel}
                        modifiers={modifiers}
                        >
                    <PopoverBody className="pl-0 pr-0">
                        {items.map(i => createDropdownItem(i, this.closePopoverPanel))}
                    </PopoverBody>
                </Popover>
    }
    render()
    {
        const cn = classnames(this.props.triggerClass, {active:!this.state.popoverRemoved})
        return (<>
                    <div className="dropdown-menu-trigger" onClick={this.onTriggerClick}>
                        <Button size="xs" className="text-truncate" color="link">
                            {this.props.triggerIcon && <i className={this.props.triggerIcon + " trigger-icon"}></i>}
                            {this.props.triggerTitle}
                            <i ref={this.triggerRef} className={cn}></i>
                        </Button>
                    </div>
                    {this.renderPopover()}
                </>)
    }
}

