import * as React from "react";
import classNames from 'classnames';
import "./Module.scss"
import { ContextNaturalKey } from "../types/intrasocial_types";

export type CommonModuleProps = {
    pageSize?:number
    contextNaturalKey?:ContextNaturalKey
    showLoadMore?:boolean
    showInModal?:boolean
    isModal?:boolean
    moduleRef?:React.LegacyRef<HTMLDivElement>
} & React.HTMLAttributes<HTMLElement>
export default class Module extends React.Component<CommonModuleProps , {}> {
    render() {
        const {children, className,moduleRef, pageSize, contextNaturalKey, showLoadMore, showInModal,isModal, ...rest} = this.props
        const cn = classNames("module main-content-background", className)
        return(
            <div {...rest} ref={moduleRef} className={cn}>
                {children}
            </div>
        );
    }
}
