import * as React from "react";
import "./Error404.scss"
type Props = {
}

export class Error404 extends React.Component<Props, {}> {
    render() {
        return(
            <div id="error404">
                404 <i className="fas fa-ban"></i>
            </div>
        );
    }
}
