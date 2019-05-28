import * as React from 'react'
import "./ProgressBar.scss"
import classnames = require('classnames');
type Props = {
    percentage:number
    height:number
    className?:string
    width?:number
    borderWidth?:number
    borderStyle?:string
    borderColor?:string
    fill?:string
}
export const ProgressBar = (props:Props) => {
    const style:React.CSSProperties = {}
    style.height = props.height
    style.width = props.width || "100%"
    style.borderRadius = props.height / 2
    style.borderWidth = props.borderWidth
    style.borderStyle = props.borderStyle
    style.borderColor = props.borderColor
    const cn = classnames("progress-bar border-1", props.className)
    return (
        <div className={cn} style={style}>
          <Filler fill={props.fill} percentage={props.percentage} />
        </div>
      )
  }
  const Filler = (props:{percentage:number, fill:string}) => {
    return <div className="filler" style={{ width: `${props.percentage}%`, background:props.fill }} />
  }