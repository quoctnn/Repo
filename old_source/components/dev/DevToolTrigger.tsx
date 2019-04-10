import * as React from "react";
import { Link} from 'react-router-dom'
import Routes from "../../utilities/Routes";

export interface Props {
}

export class DevToolTrigger extends React.Component<Props, {}> {
    constructor(props) {
        super(props);
    }
    render() {
        return(
            <div id="dev-tool-trigger">
                <Link className="btn btn-primary margin-right-sm" to={Routes.DEVELOPER_TOOL}>
                    <i className="fas fa-cog" />
                </Link>
            </div>
        );
    }
}
