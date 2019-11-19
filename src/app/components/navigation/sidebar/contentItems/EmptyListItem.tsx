import * as React from "react";
import { translate } from '../../../../localization/AutoIntlProvider';
import "../SideBarItem.scss";

export default class EmptyListItem extends React.PureComponent<{}, {}> {
    constructor(props:{}) {
        super(props)
        this.state = {
        }
    }

    render() {
        return (
            <div className="empty-list">{translate("search.result.empty")}</div>
        )
    }
}
