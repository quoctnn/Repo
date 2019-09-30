

import * as React from 'react';
import classnames from 'classnames';
import "./Checkbox.scss"
type Props = {
    checked:boolean
    onValueChange?:(checked:boolean) => void
    checkedIcon?:string
    className?:string
}
export const Checkbox = (props:Props) => {
    const getIcon = () => {
        return props.checkedIcon || "fas fa-check"
    }
    const onClick = () => {
        props.onValueChange && props.onValueChange(!props.checked)
    }
    const {checked, className, ...rest} = props
    const cn = classnames("checkbox", className, {"checked":checked})
    return (
        <div onClick={onClick} className={cn}>
            {checked && <i className={getIcon()}></i>}
        </div>
    );
  }