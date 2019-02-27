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
    enterTimeout?:number
    enterTimeoutTouch?:number
    onClick?:(event:any) => void
    debug?:boolean
}
interface DefaultProps
{
    leaveTimeout?:number
    enterTimeout?:number
    enterTimeoutHover?:number
    debug:boolean
}
interface State 
{
  
}
type Props = OwnProps & DefaultProps
export default class HoverLongPressTrigger extends React.Component<Props, State> 
{
    timeoutTimer:NodeJS.Timer
    preventClick:boolean = false
    static defaultProps:DefaultProps = {
        leaveTimeout:500,
        enterTimeout:0,
        enterTimeoutHover:500,
        debug:false
    }
    onMouseEnter = (event:React.SyntheticEvent) => {
        event.preventDefault()
        this.clearTimer()
        this.log("onMouseEnter before timeout:" +  this.props.enterTimeout)
        if(this.props.enterTimeout > 0)
            this.timeoutTimer = setTimeout(this.onHover, this.props.enterTimeout)
        else 
            this.onHover()
    }
    onMouseLeave = (event:React.SyntheticEvent) => {
        event.preventDefault()
        this.clearTimer()
        this.log("onMouseLeave before timeout:" +  this.props.leaveTimeout)
        if(this.props.leaveTimeout > 0)
            this.timeoutTimer = setTimeout(this.onHoverOut, this.props.leaveTimeout)
        else 
            this.onHoverOut()
    }
    onHover = () => {
        this.log("onHover")
        this.props.onHover()
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
        this.timeoutTimer = setTimeout(this.onLongPress, this.props.enterTimeoutTouch)
        this.log("onTouchStart")
    }
    onTouchEnd = (event:React.SyntheticEvent) => {
        this.clearTimer()
        this.log("onTouchStart")
    }
    onClick = (event:any) => {
        this.log("onClick")
        this.clearTimer()
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
        if(this.props.debug)
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