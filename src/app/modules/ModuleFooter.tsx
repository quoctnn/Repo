import * as React from "react";
import classnames = require("classnames");

export type Props =
{
} & React.HTMLAttributes<HTMLElement>

export default class ModuleFooter extends React.Component<Props, {}> {
    render() {
        const {children, className, ...rest} = this.props
        const cn = classnames("module-footer", className)
        return(
            <div {...rest} className={cn}>
            {children}
            </div>
        );
    }
}
