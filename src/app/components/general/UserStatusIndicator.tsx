import * as React from 'react';
import { AvatarStatusColor } from '../../types/intrasocial_types';
import classnames = require('classnames');

export interface Props {
    size?:number
    borderWidth?:number,
    borderColor?:string,
    statusColor:AvatarStatusColor,
}
export class UserStatusIndicator extends React.PureComponent<Props & React.HTMLAttributes<HTMLElement>, {}> {
    static defaultProps:Props = {
        size:50,
        borderWidth:0,
        borderColor:"none",
        statusColor:AvatarStatusColor.NONE,
    }
    imageStyles:{[key:string]:React.CSSProperties} = {}
    constructor(props:Props)
    {
        super(props)
    }
    render() 
    {
        const {borderColor, borderWidth, size, children, className, statusColor: stateColor,...rest} = this.props
        const cn = classnames("user-status-indicator",className)
        const style:React.CSSProperties = {
            borderWidth:borderWidth + "px", 
            borderColor:borderColor, 
            width:size + "px", 
            height:size + "px", 
            borderStyle:"solid",
            backgroundColor:stateColor, 
            borderRadius:"50%",
            display:"inline-block"
        }
        return(
            <span {...rest} className={cn} style={style}>
            </span>
        );
    }
}