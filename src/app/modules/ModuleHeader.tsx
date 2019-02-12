import * as React from "react";

export type Props = 
{
}

export default class ModuleHeader extends React.Component<Props, {}> {
    render() {
        return(
            <div className="module-header">
            {this.props.children}
            </div>
        );
    }
}
