import * as React from 'react';
import { Popover, PopoverBody } from 'reactstrap';
import classnames = require('classnames');
import { OverflowMenuItem, createDropdownItem } from './OverflowMenu';
type Props = {
    items:(() => OverflowMenuItem[]) | OverflowMenuItem[]
    className?:string
    triggerClass:string
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
        return <Popover className={cn}
                        delay={0} 
                        trigger="legacy" 
                        placement="bottom" 
                        hideArrow={false} 
                        isOpen={this.state.popoverVisible} 
                        target={this.triggerRef.current} 
                        toggle={this.closePopoverPanel}
                        modifiers={this.props.modifiers}
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
                    <i ref={this.triggerRef} onClick={this.onTriggerClick} className={cn}></i>
                    {this.renderPopover()}
                </>)
    }
}

