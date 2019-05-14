import * as React from "react";
import classnames from 'classnames';

export type Props =
{
    onClick:(event) => void
}

export default class ModuleMenuTrigger extends React.Component<Props, {}> {
    render() {
        const cn = classnames("module-menu-trigger")
        return(
            <div className={cn} onClick={this.props.onClick} >
                <span className="fa-stack">
                    <i className="fa fa-ellipsis-h fa-stack-1x icon-default"></i>
                    <i className="fa fa-times fa-stack-1x icon-active"></i>
                </span>
            </div>
        );
    }
}

