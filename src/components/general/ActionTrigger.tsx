import * as React from 'react';
import { Settings } from '../../utilities/Settings';
export interface Props 
{
    time:number
    onAction:() => void
    onActionEnd:() => void
    children:React.ReactNode
    targetRef:React.RefObject<HTMLElement>
    otherTargetRef:React.RefObject<HTMLElement>
    onPress:() => void
    clickTarget:React.RefObject<HTMLElement>
    isActive:boolean
}
interface State 
{
  
}
/**
 * Component that fires  *.
 */
export default class ActionTrigger extends React.Component<Props, State> {
    timeout:NodeJS.Timer
    outsideListener = false
    shouldShortPress = true
    componentDidMount() {
      this.listenForTouch()
    }
    componentWillUnmount() {
      this.stopListening()
    }
    startMouseEnterInterval = () => 
    {
      console.log("startMouseEnterInterval")
      this.timeout = setTimeout(this.triggerMouseAction, this.props.time)
    }
    cancelInterval = () => 
    {
      console.log("cancelInterval")
      clearTimeout(this.timeout)
    }
    startMouseLeaveInterval = () => {
      console.log("startMouseLeaveInterval")
      this.timeout = setTimeout(this.triggerMouseLeaveAction, this.props.time)
    }
    triggerMouseAction = () => 
    {
      console.log("triggerMouseAction")
      this.shouldShortPress = false
      this.props.onAction()
      this.cancelInterval()
    }
    triggerMouseLeaveAction = () => 
    {
      console.log("triggerMouseLeaveAction")
      this.props.onActionEnd()
      this.cancelInterval()
    }
    onMousesEnter = (e) => 
    {
      console.log("onMousesEnter")
      e.preventDefault()
      this.cancelInterval()
      if(!this.props.isActive)
      {
        this.startMouseEnterInterval()
      }
    }
    onMousesLeave = (e) => 
    {
      console.log("onMousesLeave")
      e.preventDefault()
      this.cancelInterval()
      if(this.props.isActive)
      {
        this.startMouseLeaveInterval()
      }
    }
    onMouseUp = (e) => 
    {
      console.log("onMouseUp")
      e.preventDefault()
      if(e.target == this.props.clickTarget.current || this.props.clickTarget.current.contains(e.target))
      {
        this.cancelInterval()
        this.sendPress()
      }
    }
    onTouchStart = (e) => 
    {
      console.log("onTouchStart")
      e.preventDefault()
      this.shouldShortPress = true
      if(!this.props.isActive)
      {
        this.addOutsideTouchListener()
        this.startMouseEnterInterval()
      }
    }
    sendPress = () => {
      console.log("onPress")
      this.props.onPress()
      if(this.props.isActive)
      {
        this.props.onActionEnd()
      }
    }
    onTouchEnd = (e) => 
    {
      e.preventDefault();
      this.cancelInterval()
      if (this.props.onPress && this.shouldShortPress) 
      {
        this.sendPress()
      }
    }
    onOutsideTouch = (e) => 
    {
        if(this.props.isActive && !this.props.targetRef.current.contains(e.target))
        {
          e.preventDefault()
          this.cancelInterval() 
          console.log("onOutsideTouch")
          this.removeOutsideTouchListener()
          this.props.onActionEnd()
        }
    }
    addOutsideTouchListener = () => 
    {
      if(!this.outsideListener)
      {
        this.outsideListener = true
        document.addEventListener('touchstart', this.onOutsideTouch);
      }
    }
    removeOutsideTouchListener = () => 
    {
      if(this.outsideListener)
      {
        this.outsideListener = false
        document.removeEventListener('touchstart', this.onOutsideTouch);
      }
    }
    listenForTouch = () => 
    {
      if (this.props.targetRef) 
      {

        if(!Settings.isTouchDevice)
        {
          this.props.targetRef.current.addEventListener('mouseenter', this.onMousesEnter)
          this.props.targetRef.current.addEventListener('mouseleave', this.onMousesLeave)
          if(this.props.otherTargetRef && this.props.otherTargetRef.current)
          {
            this.props.otherTargetRef.current.addEventListener('mouseenter', this.onMousesEnter)
            this.props.otherTargetRef.current.addEventListener('mouseleave', this.onMousesLeave)
          }
          this.props.targetRef.current.addEventListener('mouseup', this.onMouseUp)
        }
        else 
        {
          this.props.targetRef.current.addEventListener('touchstart', this.onTouchStart)
          this.props.targetRef.current.addEventListener('touchend', this.onTouchEnd)
        }
      }
    }
    stopListening = () => 
    {
        if(!Settings.isTouchDevice)
        {
          this.props.targetRef.current.removeEventListener('mouseenter', this.onMousesEnter)
          this.props.targetRef.current.removeEventListener('mouseleave', this.onMousesLeave)
          if(this.props.otherTargetRef && this.props.otherTargetRef.current)
          {
            this.props.otherTargetRef.current.removeEventListener('mouseenter', this.onMousesEnter)
            this.props.otherTargetRef.current.removeEventListener('mouseleave', this.onMousesLeave)
          }
          this.props.targetRef.current.removeEventListener('mouseup', this.onMouseUp)
        }
        else 
        {
          this.props.targetRef.current.removeEventListener('touchstart', this.onTouchStart)
          this.props.targetRef.current.removeEventListener('touchend', this.onTouchEnd)
        }
    }
    render() {
      return <>{this.props.children}</>
    }
  }