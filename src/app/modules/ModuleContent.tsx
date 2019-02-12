import * as React from "react";

export type Props = 
{
}

export default class ModuleContent extends React.Component<Props, {}> {
    render() {
        return(
            <div className="module-content">
            {this.props.children}
            </div>
        );
    }
}
