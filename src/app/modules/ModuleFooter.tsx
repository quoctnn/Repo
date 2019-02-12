import * as React from "react";

export type Props = 
{
}

export default class ModuleFooter extends React.Component<Props, {}> {
    render() {
        return(
            <div className="module-footer">
            {this.props.children}
            </div>
        );
    }
}
