import * as React from "react";
import { Link } from "react-router-dom";
import Routes from "../../utilities/Routes";
import { translate } from "../../components/intl/AutoIntlProvider";
import Conversations from "./Conversations";
import { Collapsible } from '../../components/general/Collapsible';
require("./ConversationSidebar.scss");
export interface Props {
}
export interface State {

}
export class ConversationSidebar extends React.Component<Props, State> {
    static defaultProps:Props = {
    }
    constructor(props:Props) {
        super(props);
        this.state = {}
    }
    render() 
    {
        return(
            <div id="conversation-sidebar">
                <div className="d-flex align-self-end margin-md">
                    <Link className="btn btn-dark flex-shrink-0" to={Routes.CONVERSATION_CREATE}>
                        <i className="fas fa-plus"></i>
                        <span className="text-success padding-left-xs">{translate("New conversation")}</span>
                    </Link>
                </div>
                <Collapsible title={translate("Conversations")}>
                    <Conversations />
                </Collapsible>
                <Collapsible title={translate("Conversations")}>
                    <Conversations />
                </Collapsible>
            </div>
        );
    }
}