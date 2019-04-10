import * as React from "react";
import { nullOrUndefined } from '../../utilities/Utilities';
import { throws } from "assert";
require("./CollapsiblePanel.scss");

export enum ArrowDirectionCollapsed
{
    LEFT = "fas fa-angle-double-left",
    RIGHT = "fas fa-angle-double-right" 
}
export interface Props {
    arrowDirectionCollapsed:ArrowDirectionCollapsed,
    className?:string
    id?:string
    onCollapsibleStateChanged?:(open:boolean) => void
}
export interface State {
    open:boolean

}

export class CollapsiblePanel extends React.Component<Props, {}> {
    static defaultProps:Props = {
        arrowDirectionCollapsed:ArrowDirectionCollapsed.LEFT,
        className : "",
        id:null
    }
    state:State
    constructor(props:Props) {
        super(props);
        this.state = {open: false}
    }
    toggleOpenState = () => 
    {
        this.setState({open:!this.state.open}, () => {
            if(this.props.onCollapsibleStateChanged)
                this.props.onCollapsibleStateChanged(this.state.open)
        })
    }
    render() 
    {
        let arrow = this.props.arrowDirectionCollapsed == ArrowDirectionCollapsed.LEFT && !this.state.open ? ArrowDirectionCollapsed.LEFT : ArrowDirectionCollapsed.RIGHT
        return(
            <div id={this.props.id} className={"collapsible-panel transition" +  (this.state.open ? " open" : "") + " " + this.props.className }>
                <div className="content-panel">
                    {this.props.children}
                </div>
                <button className="toggle-button btn btn-primary" onClick={this.toggleOpenState}><i className={arrow}></i></button>
            </div>
        );
    }
}