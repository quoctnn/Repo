import * as React from "react";
require("./List.scss");

export interface Props {
    className?:string,
    id?:string
}
export interface State {
}
export class List extends React.Component<Props, {}> {
    static defaultProps:Props = {
        className:null,
        id:null
    }
    state:State
    constructor(props) {
        super(props);
        this.state = {open:false}
    }
    render() 
    {
        return(
            <ul {...this.props}  className={"list" + (this.props.className ? " " + this.props.className : "") } >
                {this.props.children}
            </ul>
        );
    }
}