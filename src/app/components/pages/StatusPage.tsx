import * as React from "react";
import "./StatusPage.scss"
import { DashboardWithData } from "../../DashboardWithData";
type OwnProps = {
    match:any,
}
type State = {
}
type Props = OwnProps
export default class StatusPage extends React.Component<Props, State>
{
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    render() {
        return(
            <div id="status-page" className="dashboard-container">
                <div className="content">
                    <DashboardWithData category="status" />
                </div>
            </div>
        );
    }
}