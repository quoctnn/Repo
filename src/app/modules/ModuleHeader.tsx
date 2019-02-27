import * as React from "react";
import classnames from "classnames"

export type Props = 
{
}

export default class ModuleHeader extends React.Component<Props & React.HTMLAttributes<any>, {}> {
    render() {
        const {className,...rest} = this.props
        const cn = classnames("module-header", className)
        return(
            <div {...rest} className={cn}>
            {this.props.children}
            </div>
        );
    }
}
