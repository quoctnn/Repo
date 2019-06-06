import * as React from "react";
import { ButtonGroup, Button, UncontrolledTooltip, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, DropdownItemProps } from "reactstrap";
import { translate } from "../../localization/AutoIntlProvider";
import classnames from 'classnames';
require("./OverflowMenu.scss");
export enum OverflowMenuItemType {
    option, divider, header
}
export type OverflowMenuItem = {
    onPress?:(event:any) => void
    iconClass?:string
    iconStackClass?:string
    title?:string
    id:string
    toggleMenu?:boolean
    type:OverflowMenuItemType
    active?:boolean
    disabled?:boolean
    children?:React.ReactElement<any> | React.ReactElement<any>[]
}
type Props = {
    fetchItems:() => OverflowMenuItem[]
    maxVisible:number,
    buttonIconClass?:string
    refresh:string

}
type State = {
    dropdownOpen:boolean, 
    items:OverflowMenuItem[]
    needsUpdate:boolean
}
export const createDropdownItem = (item:OverflowMenuItem) => {
    const useStackedIcons = !!item.iconStackClass && !!item.iconClass
    const props:Partial<DropdownItemProps> = {}
    if(item.type == OverflowMenuItemType.header)
        props.header = true
    else if(item.type == OverflowMenuItemType.divider)
        props.divider = true
    if(item.disabled)
        props.disabled = true
    const toggle = !!item.toggleMenu
    return (<DropdownItem active={item.active}  {...props} toggle={toggle} key={item.id} onClick={item.onPress} className="clickable">
                    {!useStackedIcons && item.iconClass && <i className={item.iconClass}></i>}
                    {useStackedIcons && <span className="fa-menu-icon-stack">
                        <i className={item.iconClass}></i>
                        <i className={item.iconStackClass + " fa-menu-icon-stacked"}></i>
                    </span>}
                    {item.children}
                    {item.title}
            </DropdownItem>)
}
export class OverflowMenu extends React.Component<Props, State> {
    showTooltip = false
    constructor(props:Props) {
        super(props);
        this.state = {
            dropdownOpen:false,
            items:[],
            needsUpdate:false,
        }
    }
    componentDidUpdate = (prevProps:Props, prevState:State) => {
        const needsUpdate = prevProps.refresh != this.props.refresh || this.state.items.length == 0
        if(this.state.dropdownOpen && needsUpdate)
        {
            this.setState(prevState => ({
                items:this.props.fetchItems(), needsUpdate:false
            }))
        }
        else { //fetch later?
            if(needsUpdate && this.state.needsUpdate != needsUpdate)
            {
                this.setState(prevState => ({
                    needsUpdate
                }))
            }
        }
    }
    toggle = () => {
        let items = this.state.items
        if(!this.state.dropdownOpen && this.state.needsUpdate)
        {
            items = this.props.fetchItems()
        }
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen, items, needsUpdate:false
        }))
    }
    render() {
        let allItems:OverflowMenuItem[] = []
        let rest:OverflowMenuItem[] = []
        const splitIndex = this.props.maxVisible - 1
        for (let index = 0; index < this.state.items.length; index++) {
            if(index <= splitIndex)
                allItems.push(this.state.items[index])
            else 
                rest.push(this.state.items[index])
        }
        const hasMore = rest.length > 0 || this.props.maxVisible == 0
        const cn = classnames("overflow-menu",{active:this.state.dropdownOpen})
        return (
            <div className={cn}>
                <ButtonGroup>
                    {allItems.map(i => {
                        const id = "overflowmenuitem_" + i.id
                        const useStackedIcons = !!i.iconStackClass && !!i.iconClass
                        return (<React.Fragment key={"overflowmenuitem_fragment" + i.id}>
                                    <Button color="light" id={id} size="xs" key={"overflowmenuitem_button" + i.id} onClick={i.onPress} title={i.title}>
                                        {!useStackedIcons && i.iconClass && <i className={i.iconClass}></i>}
                                        {useStackedIcons && <span className="fa-stack">
                                            <i className={i.iconClass + " fa-stack-2x"}></i>
                                            <i className={i.iconStackClass + " fa-stack-1x"}></i>
                                        </span>}
                                    </Button>
                                    {this.showTooltip && 
                                        <UncontrolledTooltip delay={0} key={"overflowmenuitem_tooltip" + i.id} placement="top" target={id}>
                                        {i.title}
                                        </UncontrolledTooltip>
                                    }
                              </React.Fragment>)
                    })}
                    {hasMore && 
                        <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                            <DropdownToggle color="link" id="overflowmenuitem_overflow" size="xs" data-boundary="window">
                                <i className={"btn-options " + this.props.buttonIconClass || "fa fa-ellipsis-h"}></i>
                            </DropdownToggle>
                            {this.showTooltip && 
                                <UncontrolledTooltip delay={0} key="overflowmenuitem_tooltip_overflow" placement="top" target="overflowmenuitem_overflow">
                                    {translate("More actions")}
                                </UncontrolledTooltip>
                            }
                            <DropdownMenu>
                                {rest.map(i => {
                                    return createDropdownItem(i)
                                })}
                            </DropdownMenu>
                        </Dropdown>
                    }
                </ButtonGroup>
            </div>
        )
    }
}