import * as React from "react";
import "./Dashboard.scss"
import { ResponsiveBreakpoint } from "./components/general/observers/ResponsiveComponent";
import { ApplicationManager } from "./managers/ApplicationManager";
import WindowResponsiveComponent from "./components/general/observers/WindowResponsiveComponent";
import DashboardComponent from "./Dashboard";
import { translate } from "./localization/AutoIntlProvider";
export const DashboardWithData = (props:{category:string, updateKey?:string}) => {
    const dashboards = ApplicationManager.getDashboards(props.category)
    const dashboard = dashboards[0] 
    if(!dashboard)
    {
        return <div>{translate("dashboard.error.not.found")}</div>
    }
    dashboard.grid_layouts = dashboard.grid_layouts.filter(gl => {
        if(gl.grid_modules.length == 0)
        {
            console.error("Dashboard grid '" + gl.title + "' does not contain any modules")
            return false
        }
        return true
    })
    let breakpoints = dashboard.grid_layouts.map(l => l.min_width).filter(b => b > ResponsiveBreakpoint.standard)
    breakpoints.push(ResponsiveBreakpoint.standard)
    breakpoints.push(ResponsiveBreakpoint.mini)
    breakpoints = breakpoints.sort((a, b) => b - a) //descending
    return (

        <WindowResponsiveComponent
            breakpoints={breakpoints} 
            updateKey={props.updateKey} 
            setClassOnBody={true} 
            render={({ breakpoint }) => (
                <DashboardComponent
                    dashboard={dashboard}
                    breakpoint={breakpoint}
                    updateKey={props.updateKey} 
                />
        )}/>
    );
}