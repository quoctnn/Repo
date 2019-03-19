import * as React from "react";
import { ButtonGroup, Button, UncontrolledTooltip, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, DropdownItemProps } from "reactstrap";
import { translate } from "../../localization/AutoIntlProvider";
import classnames from 'classnames';
import { nullOrUndefined } from '../../utilities/Utilities';
require("./OverflowMenu.scss");
export enum OverflowMenuItemType {
    option, divider, header
}
export type OverflowMenuItem = {
    onPress?:(event:any) => void
    iconClass?:string
    title?:string
    id:string
    toggleMenu?:boolean
    type:OverflowMenuItemType
    active?:boolean
    disabled?:boolean
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
                        return (<React.Fragment key={"overflowmenuitem_fragment" + i.id}>
                                    <Button color="light" id={id} size="xs" key={"overflowmenuitem_button" + i.id} onClick={i.onPress} title={i.title}>
                                        <i className={i.iconClass}></i>
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
                                    const props:Partial<DropdownItemProps> = {}
                                    if(i.type == OverflowMenuItemType.header)
                                    props.header = true
                                    else if(i.type == OverflowMenuItemType.divider)
                                        props.divider = true
                                    if(i.disabled)
                                        props.disabled = true
                                    const toggle = nullOrUndefined( i.toggleMenu ) ? true : i.toggleMenu

                                    return (<DropdownItem active={i.active}  {...props} toggle={toggle} key={i.id} onClick={i.onPress} className="clickable">
                                                    {i.iconClass && <i className={i.iconClass}></i>}
                                                    {i.title}
                                            </DropdownItem>)
                                })}
                            </DropdownMenu>
                        </Dropdown>
                    }
                </ButtonGroup>
            </div>
        )
    }
}