import * as React from 'react'
import { History } from 'history'
import { Link } from 'react-router-dom'
import "./GenericListItem.scss"
import classnames from 'classnames';
type GenericListItemProps = {
    to?:History.LocationDescriptor<any>
    left?:React.ReactNode
    header:React.ReactNode
    footer?:React.ReactNode
    right?:React.ReactNode
    className?:string
    containerClassName?:string
    onClick?:(e:React.SyntheticEvent) => void
}

export const GenericListItem = (props:GenericListItemProps) => {

    const renderContent = () => {
        const {left, header, footer, right} = props
        return <div className={classnames("list-item-content p-1 d-flex", props.className)}>
            {left && <div className="left">{left}</div>}
            <div className="center">
                {header && <div className="header text-truncate">{header}</div>}
                {footer && <div className="footer text-truncate text-muted">{footer}</div>}
            </div>
            {right && <div className="right">{right}</div>}
        </div>
    }
    const cn = classnames("generic-list-item flex-grow-1",props.containerClassName)
    if(props.to)
        return <Link onClick={props.onClick} className={cn} to={props.to}>{renderContent()}</Link>
    return <div onClick={props.onClick} className={cn}>{renderContent()}</div>
}