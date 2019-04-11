import * as React from "react";
import classNames from 'classnames';
import "./Module.scss"

export type Props = 
{
    className?:string
}

export default class Module extends React.Component<Props, {}> {
    render() {
        const {children, className, ...rest} = this.props
        const cn = classNames("module main-content-background drop-shadow", className)
        return(
            <div {...rest} className={cn}>
                {children}
            </div>
        );
    }
}
