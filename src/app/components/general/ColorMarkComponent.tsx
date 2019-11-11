
import * as React from "react";
import "./ColorMarkComponent.scss"
import classnames from 'classnames';

type Props = {
    color:string
    className?:string
}
const ColorMarkComponent = (props:Props) => (
    <span className={classnames("color-mark", props.className)} style={{backgroundColor:props.color}}></span>
)
export default  ColorMarkComponent