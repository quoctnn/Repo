import * as React from "react";
import "./CircleMenu.scss"
import { SimpleAvatar } from "./general/SimpleAvatar";

export type Props = 
{
    size?:number
}

export class CircleMenu extends React.Component<Props, {}> 
{
    static defaultProps:Props = {
        size:50,
    }
    render() {
        return(
            <div className="circle-menu">
                <SimpleAvatar size={this.props.size} />
            </div>
        );
    }
}
