import * as React from "react";
require("./Avatar.scss");

export interface Props {
    size?:number
    borderWidth?:number,
    borderColor?:string,
    image:string
}

export class Avatar extends React.Component<Props, {}> {
    static defaultProps:Props = {
        size:50,
        borderWidth:0,
        borderColor:"none",
        image:null
	};
    render() 
    {
        return(
            <div className="avatar" style={{backgroundImage:"url(\"" + this.props.image + "\")", borderWidth:this.props.borderWidth + "px", borderColor:this.props.borderColor, width:this.props.size + "px", height:this.props.size + "px", borderStyle:"solid"}}>
            </div>
        );
    }
}