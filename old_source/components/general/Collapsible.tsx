import * as React from "react";
import classnames from 'classnames';
import { Collapse } from "reactstrap";
require("./Collapsible.scss");

enum ArrowDirections
{
    UP = "fas fa-sm chevron fa-chevron-up",
    DOWN = "fas fa-sm chevron fa-chevron-down" 
}
export interface Props {
    title?:React.ReactNode
    className?:string
    id?:string
    onCollapsibleStateChanged?:(open:boolean) => void
    initiallyOpen?:boolean
}
export interface State {
    open:boolean

}

export class Collapsible extends React.Component<Props, State> {
    static defaultProps:Props = {
        initiallyOpen:false,
        className : "",
        id:null
    }
    constructor(props:Props) {
        super(props);
        this.state = {open: props.initiallyOpen}
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
        const arrow = classnames(this.state.open ? ArrowDirections.UP : ArrowDirections.DOWN)
        const cn = classnames("collapsible", {open:this.state.open},this.props.className)
        return(
            <div id={this.props.id} className={cn}>
                <button className="toggle-button btn btn-sm btn-primary d-flex" onClick={this.toggleOpenState}>
                    <div className="content">{this.props.title}</div>
                    <div className="flex-grow-1"></div>
                    <i className={arrow}></i>
                </button>
                <Collapse isOpen={this.state.open}>
                    {this.props.children}
                </Collapse>
            </div>
        );
    }
}