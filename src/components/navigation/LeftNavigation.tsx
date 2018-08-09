import * as React from "react";
require("./LeftNavigation.scss");

export interface Props {
}

export class LeftNavigation extends React.Component<Props, {}> {
    render() {
        return(
            <div id="left-navigation" className="flex">
                LeftNavigation
            </div>
        );
    }
}