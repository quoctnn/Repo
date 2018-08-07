import * as React from "react";
require("./DevTool.scss");


export interface Props {
}

export class DevTool extends React.Component<Props, {}> {
    render() {
        return(
            <div id="dev-tool">
                DevTool
            </div>
        );
    }
}