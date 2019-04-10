import * as React from "react";
import { Link, withRouter, RouteComponentProps} from 'react-router-dom'
import Routes from "../../utilities/Routes";

type Props = {
} & RouteComponentProps<any>

class DevToolTrigger extends React.Component<Props, {}> {
    constructor(props) {
        super(props);
    }
    render() {
        const isDeveloperTool = this.props.location.pathname == Routes.DEVELOPER_TOOL
        const linkLocation = isDeveloperTool ? Routes.ROOT : Routes.DEVELOPER_TOOL
        const icon = isDeveloperTool ? "fas fa-home" : "fas fa-cog"
        return(
            <div id="dev-tool-trigger" style={{position:"fixed", bottom:5, right:5, zIndex:9999999}}>
                <Link className="btn btn-primary margin-right-sm" to={linkLocation}>
                    <i className={icon} />
                </Link>
            </div>
        );
    }
}
export default withRouter(DevToolTrigger)