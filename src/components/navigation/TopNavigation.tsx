import * as React from "react";
import { Link } from 'react-router-dom'
import {injectIntl, InjectedIntlProps} from "react-intl";
import Intl from "../../utilities/Intl"
require("./TopNavigation.scss");
export interface Props {
}

class TopNavigation extends React.Component<Props & InjectedIntlProps, {}> {
    render() {
        return(
            <div id="top-navigation" className="flex align-center">
                <div className="">TopNavigation</div>
                <div className="flex-grow flex-shrink"></div>
                <div className="">
                    <Link className="btn btn-outline-secondary" to="/signin">{Intl.translate(this.props.intl, "Sign in")}</Link>
                </div>
            </div>
        );
    }
}
export default injectIntl(TopNavigation);