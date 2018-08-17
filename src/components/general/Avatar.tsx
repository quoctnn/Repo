import { appendTokenToUrl } from '../../utilities/Utilities';
import * as React from 'react';
import { Settings } from '../../utilities/Settings';
require("./Avatar.scss");

export interface Props {
    size?:number
    borderWidth?:number,
    borderColor?:string,
    image:string,
    stateColor?:AvatarStateColor,
}
export enum AvatarStateColor
{
    GREEN = "green",
    ORANGE = "orange",
    RED = "red", 
    GRAY = "gray",
    NONE = "none",
}
export class Avatar extends React.Component<Props & React.HTMLAttributes<HTMLElement>, {}> {
    static defaultProps:Props = {
        size:50,
        borderWidth:0,
        borderColor:"none",
        image:null,
        stateColor:AvatarStateColor.NONE,
        
	};
    render() 
    {
        var imgUrl = appendTokenToUrl(this.props.image)
        return(
            
            <div onClick={this.props.onClick} className="avatar" style={{backgroundImage:"url(\"" + imgUrl + "\")", borderWidth:this.props.borderWidth + "px", borderColor:this.props.borderColor, width:this.props.size + "px", height:this.props.size + "px", borderStyle:"solid"}}>
                {this.props.stateColor != AvatarStateColor.NONE && <div className={"avatar-state " + this.props.stateColor}></div>}
            </div>
        );
    }
}