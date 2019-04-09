import * as React from "react";
import "./Error404.scss"
import { Link } from "react-router-dom";

type Props = {
}

export class Error404 extends React.Component<Props, {}> {
    render() {
        return(
            <div id="error404">
                404 <i className="fas fa-ban"></i>
                <Link to="/">HOME</Link>

            </div>
        );
    }
}
