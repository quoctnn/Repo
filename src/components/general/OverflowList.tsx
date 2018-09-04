import * as React from "react";
require("./OverflowList.scss");

export interface Props {
    children:React.ReactNode[],
    count:number,
    size:number
}
export class OverflowList extends React.Component<Props, {}> {
    static defaultProps:Props = {
        size:50,
        children:null,
        count:0
	};
    constructor(props) {
        super(props);
    }
    
    shouldComponentUpdate(nextProps:Props, nextState) {
        return false
    }
    render() {
        return (
            <ul className="overflow-list">
                {this.props.children.length < this.props.count && 
                    <li key="cm" className="count-container" style={{minWidth:this.props.size + "px", height:this.props.size + "px", borderRadius:this.props.size/2 + "px"}}>
                        <div className="text-center count">{this.props.count}</div>
                    </li>
                }
                {this.props.children}
            </ul>
        )
    }
}