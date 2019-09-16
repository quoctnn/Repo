import * as React from "react";
import classnames from 'classnames';
import "./AnimatedIconStack.scss"
type AnimatedIconStackProps = {
    className?:string
    iconA:string 
    iconB?:string
    onClick?: (event:React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    active?:boolean
    size?:number
}
export const AnimatedIconStack = (props:AnimatedIconStackProps) => {
    const cn = classnames("animated-icon-stack", props.className, {active:props.active})
    const aCn = classnames(`fa-stack-${props.size || 1}x`, "icon-default", props.iconA)
    const bCn = classnames(`fa-stack-${props.size || 1}x`, "icon-active", props.iconB || "fas fa-times")
    return <div onClick={props.onClick} className={cn}>
                <span className="fa-stack">
                    <i className={aCn}></i>
                    <i className={bCn}></i>
                </span>
            </div>
}
