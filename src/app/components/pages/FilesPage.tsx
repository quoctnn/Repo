import * as React from "react";
import { Dashboard, GridColumns, GridColumn, Module } from '../../types/intrasocial_types';
import { DashboardWithData } from "../../DashboardWithData";
import { ApplicationManager } from '../../managers/ApplicationManager';
type OwnProps = {
}
type State = {
}
type Props = OwnProps
export default class FilesPage extends React.Component<Props, State> 
{
    constructor(props:Props) {
        super(props);
        this.state = {
        }
        this.setDashboard()
    }
    setDashboard = () => {
        const module:Module = {id: 0,
            name: "",
            type: "FilesModule",
            disabled: false,
            properties: {}}
        const columns:GridColumn[] = [{id: 0,
            module: module,
            width: 12,
            children: null,
            index: 0}]
        const gridColumns:GridColumns = {id: 0,
            columns: columns,
            title: "files",
            min_width: 1000,
            fill: true,}
        const dashboard:Dashboard = {
                id:0, 
                grid_layouts:[gridColumns],
                created_at: "",
                updated_at: "",
                hidden: false,
                hidden_reason: null,
                position: 0,
                title: "files",
                slug: "",
                user: 0,
                category: "files"
            }
        ApplicationManager.setDashboard(dashboard)
    }
    render() {
        return(
            <div id="files-page" className="dashboard-container">
                <div className="content">
                    <DashboardWithData category="files" />
                </div>
            </div>
        );
    }
}