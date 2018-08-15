import * as React from "react";
import { Settings } from '../../utilities/Settings';
require("./Avatar.scss");

export interface Props {
    size?:number
    borderWidth?:number,
    borderColor?:string,
    image:string,
    stateColor?:AvatarStateColor
}
export enum AvatarStateColor
{
    GREEN = "green",
    ORANGE = "orange",
    RED = "red", 
    GRAY = "gray",
    NONE = "none",
}
export class Avatar extends React.Component<Props, {}> {
    static defaultProps:Props = {
        size:50,
        borderWidth:0,
        borderColor:"none",
        image:null,
        stateColor:AvatarStateColor.NONE
	};
    render() 
    {
        var imgUrl = this.props.image
        if(imgUrl && Settings.accessToken)
        {
            let img = new URL(this.props.image)
            img.searchParams.set('token', Settings.accessToken);
            imgUrl = img.href
        }
        return(
            <div className="avatar" style={{backgroundImage:"url(\"" + imgUrl + "\")", borderWidth:this.props.borderWidth + "px", borderColor:this.props.borderColor, width:this.props.size + "px", height:this.props.size + "px", borderStyle:"solid"}}>
                {this.props.stateColor != AvatarStateColor.NONE && <div className={"avatar-state " + this.props.stateColor}></div>}
            </div>
        );
    }
}