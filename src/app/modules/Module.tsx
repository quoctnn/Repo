import * as React from "react";
import classNames from 'classnames';
import "./Module.scss"
import { ContextNaturalKey } from "../types/intrasocial_types";

type Props = 
{
}

export type CommonModuleProps = {
    pageSize?:number
    style?:React.CSSProperties
    contextNaturalKey?:ContextNaturalKey
    showLoadMore?:boolean
    showInModal?:boolean
    isModal?:boolean
}
export default class Module extends React.Component<Props & React.HTMLAttributes<HTMLElement>, {}> {
    render() {
        const {children, className, ...rest} = this.props
        const cn = classNames("module main-content-background", className)
        return(
            <div {...rest} className={cn}>
                {children}
            </div>
        );
    }
}
