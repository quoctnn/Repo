import * as React from 'react';
import classnames = require('classnames');
interface OwnProps 
{
    className?: string
    onHover:() => void
    onHoverOut:() => void
    onLongPress:() => void
    style?:React.CSSProperties
    leaveTimeout?:number
    onClick?:(event:any) => void
}
interface DefaultProps
{
    leaveTimeout?:number
}
interface State 
{
  
}
type Props = OwnProps & DefaultProps
export default class HoverLongPressTrigger extends React.Component<Props, State> 
{
    timeout:number = 500
    timeoutTimer:NodeJS.Timer
    preventClick:boolean = false
    static defaultProps:DefaultProps = {
        leaveTimeout:500,
    }
    onMouseEnter = (event:React.SyntheticEvent) => {
        event.preventDefault()
        this.clearTimer()
        this.log("onMouseEnter")
        this.props.onHover()
    }
    onMouseLeave = (event:React.SyntheticEvent) => {
        event.preventDefault()
        this.clearTimer()
        this.log("onMouseLeave before timeout")
        if(this.props.leaveTimeout > 0)
            this.timeoutTimer = setTimeout(this.onHoverOut, this.props.leaveTimeout)
        else 
            this.onHoverOut()
    }
    onHoverOut = () => {
        this.log("onHoverOut")
        this.props.onHoverOut()
    }
    onLongPress = () => {
        this.preventClick = true
        this.props.onLongPress()
    }
    onTouchStart = (event:React.SyntheticEvent) => {
        this.preventClick = false
        this.timeoutTimer = setTimeout(this.onLongPress, this.timeout)
        this.log("onTouchStart")
    }
    onTouchEnd = (event:React.SyntheticEvent) => {
        this.clearTimer()
    }
    onClick = (event:any) => {
        if(this.preventClick)
            event.preventDefault()
        else 
            this.props.onClick(event)
    }
    clearTimer = () => {
        clearTimeout(this.timeoutTimer)
        this.timeoutTimer = null
        this.log("clearTimer")
    }
    log = (text:string) => {

        console.log(text + " " + this.props.className)
    }
    render() {
        const click = this.props.onClick ? this.onClick : undefined
        const cn = classnames("", this.props.className)
        return <div style={this.props.style} className={cn} 
        onClick={click}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}

        onTouchStart={this.onTouchStart}
        onTouchCancel={this.onTouchEnd}
        onTouchEnd={this.onTouchEnd}>
                    {this.props.children}
                </div>
    }
  }