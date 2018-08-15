import * as React from "react";
import {injectIntl, InjectedIntlProps} from "react-intl";
import ProfileStatus from "../general/ProfileStatus";
import {Settings} from "../../utilities/Settings"
import { DevToolTrigger } from '../dev/DevToolTrigger';
require("./TopNavigation.scss");
export interface Props {
}
class TopNavigation extends React.Component<Props & InjectedIntlProps, {}> {
    render() {
        return(
            <div id="top-navigation" className="flex align-center">
                <div className="">TopNavigation</div>
                <div className="flex-grow flex-shrink"></div>
                <div className="flex">
                    {!Settings.isProduction && <DevToolTrigger /> }
                    <ProfileStatus />
                </div>
            </div>
        );
    }
}
export default injectIntl(TopNavigation);