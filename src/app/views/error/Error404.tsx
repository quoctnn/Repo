import * as React from "react";
import "./Error404.scss"
import { Link } from "react-router-dom";
import Ufo from "../../components/general/images/Ufo";
import EmptyBox from "../../components/general/images/EmptyBox";
import IceCream from "../../components/general/images/IceCream";

type Props = {
}

export class Error404 extends React.Component<Props, {}> {
    render() {
        return(
            <div id="error404" className="text-center m-4">
                <div><h1>404 <i className="fas fa-ban"></i></h1></div>
                <div><Ufo className="img-responsive" width="400" height="400" style={{maxWidth:400, height:"auto"}} /></div>
                <div><Link to="/">HOME</Link></div>
            </div>
        );
    }
}
