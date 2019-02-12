import * as React from "react";

export type Props = 
{
    onClick:(event) => void
}

export default class ModuleMenuTrigger extends React.Component<Props, {}> {
    render() {
        return(
            <div className="module-menu-trigger" onClick={this.props.onClick} >
                <i className="fa fa-ellipsis-v"></i>
            </div>
        );
    }
}

                        