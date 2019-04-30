import * as React from "react";
import { History } from 'history'
import { Link, withRouter, RouteComponentProps} from 'react-router-dom'
import Routes from "../../utilities/Routes";

type Props = {
    onClick:(e:React.SyntheticEvent<any>) => void
} & RouteComponentProps<any>

class DevToolTrigger extends React.Component<Props, {}> {
    constructor(props) {
        super(props);
    }
    shouldComponentUpdate = (prevProps:Props) => {
        return prevProps.history.location.pathname != this.props.location.pathname
    }
    render() {
        const isDeveloperTool = this.props.location.pathname == Routes.DEVELOPER_TOOL.path
        const linkLocation:History.LocationDescriptor<any> = isDeveloperTool ? this.props.location.state || Routes.ROOT : { pathname:Routes.DEVELOPER_TOOL, state:this.props.location.pathname} 
        const icon = isDeveloperTool ? "far fa-arrow-alt-circle-left" : "fas fa-cog"
        return(
            <div  id="dev-tool-trigger" style={{position:"fixed", bottom:5, right:5, zIndex:9999999}}>
                <Link onClick={this.props.onClick} className="btn btn-primary margin-right-sm" to={linkLocation}>
                    <i className={icon} />
                </Link>
            </div>
        );
    }
}
export default withRouter(DevToolTrigger)