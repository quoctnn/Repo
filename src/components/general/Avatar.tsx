import * as React from 'react';
import { IntraSocialUtilities } from '../../utilities/IntraSocialUtilities';
require("./Avatar.scss");

export interface Props {
    size?:number
    borderWidth?:number,
    borderColor?:string,
    image:string,
    stateColor?:AvatarStateColor,
    className?:string
}
export enum AvatarStateColor
{
    GREEN = "green",
    ORANGE = "orange",
    RED = "red", 
    GRAY = "gray",
    NONE = "none",
}
export class Avatar extends React.PureComponent<Props & React.HTMLAttributes<HTMLElement>, {}> {
    static defaultProps:Props = {
        size:50,
        borderWidth:0,
        borderColor:"none",
        image:null,
        stateColor:AvatarStateColor.NONE,
        
	};
    render() 
    {
        var imgUrl = IntraSocialUtilities.appendAuthorizationTokenToUrl(this.props.image)
        return(
            
            <div onClick={this.props.onClick} className={"avatar" + (this.props.className ? " " + this.props.className : "")} style={{backgroundImage:"url(\"" + imgUrl + "\")", borderWidth:this.props.borderWidth + "px", borderColor:this.props.borderColor, width:this.props.size + "px", height:this.props.size + "px", borderStyle:"solid"}}>
                {this.props.children}
                {this.props.stateColor != AvatarStateColor.NONE && <div className={"avatar-state " + this.props.stateColor}></div>}
            </div>
        );
    }
}