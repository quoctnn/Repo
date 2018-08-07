import * as React from "react";

export interface Props {
    compiler: string;
    framework: string;
}

export class Main extends React.Component<Props, {}> {
    render() {
        return(
            <h1 style={{textAlign:'center'}}>Welcome to intraSocial, using {this.props.compiler} on {this.props.framework}!</h1>
        );
    }
}