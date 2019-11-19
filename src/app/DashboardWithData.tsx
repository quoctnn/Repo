import * as React from "react";
import "./Dashboard.scss"
import { ResponsiveBreakpoint } from "./components/general/observers/ResponsiveComponent";
import { ApplicationManager } from "./managers/ApplicationManager";
import WindowResponsiveComponent from "./components/general/observers/WindowResponsiveComponent";
import DashboardComponent from "./Dashboard";
import { translate } from "./localization/AutoIntlProvider";
import { Dashboard, GridColumn, GridColumns, Module} from "./types/intrasocial_types";
import { NotificationCenter } from "./utilities/NotificationCenter";
import { EventSubscription } from "fbemitter";
import { uniqueId } from './utilities/Utilities';

export const ModuleResizeExpandNotification = "ModuleResizeExpandNotification"
export const ModuleResizeResetNotification = "ModuleResizeResetNotification"

const getProcessedBreakpoint = (category:string) => {
    const dashboard = ApplicationManager.getDashboards(category)
    if(!dashboard)
    {
        return null
    }
    dashboard.grid_layouts = dashboard.grid_layouts.filter(gl => {
        if(gl.columns.length == 0)
        {
            console.error("Dashboard grid '" + gl.title + "' does not contain any columns")
            return false
        }
        return true
    })
    let breakpoints = dashboard.grid_layouts.map(l => l.min_width).filter(b => b > ResponsiveBreakpoint.standard)
    breakpoints.push(ResponsiveBreakpoint.standard)
    breakpoints.push(ResponsiveBreakpoint.mini)
    breakpoints = breakpoints.sort((a, b) => b - a) //descending
    return {dashboard, breakpoints}
}
const applyGridColumnsParent = (gridColumns:GridColumn[], parent?:GridColumn) => {
    gridColumns.forEach(gc => {
        gc.parent = parent
        if(gc.module)
            gc.module.parent = gc
        gc.children && applyGridColumnsParent(gc.children, gc)
    })
}
const findModuleInColumn = (id:number, columns:GridColumn[]):Module => {
    for (let index = 0; index < columns.length; index++) {
        const g = columns[index]
        if(g.module && g.module.id == id)
            return g.module
        if(g.children)
        {
            const m = findModuleInColumn(id, g.children)
            if(m)
                return m
        }
    }
    return null
}
const findModuleInColumns = (id:number, gridColumns:GridColumns[]) => {
    for (let index = 0; index < gridColumns.length; index++) {
        const gc = gridColumns[index]
        const m = findModuleInColumn(id, gc.columns)
        if(m)
            return m
    }
    return null
}
const findModulesInColumn = (columns:GridColumn[]) => {
    const modules:Module[] = []
    columns.forEach(g => {
        if(g.module)
            modules.push(g.module)
        g.children && modules.push(...findModulesInColumn(g.children))
    })
    return modules
}
const findModules = (gridColumns:GridColumns[]) => {
    const modules:Module[] = []
    gridColumns.forEach(gc => {
        gc.columns && modules.push(...findModulesInColumn(gc.columns))
    })
    return modules
}
type Props = {category:string, updateKey?:string}

type State = {
    breakpoints:number[]
    dashboard: Dashboard
    updateKey?:string
}
export class DashboardWithData extends React.Component<Props, State> {

    observers:EventSubscription[] = []
    constructor(props:Props) {
        super(props)
        const data = getProcessedBreakpoint(props.category)
        this.state = {
            breakpoints:data && data.breakpoints,
            dashboard:data && data.dashboard
        }
        this.observers.push(NotificationCenter.addObserver(ModuleResizeExpandNotification, this.processModuleResizeExpandNotification))
        this.observers.push(NotificationCenter.addObserver(ModuleResizeResetNotification, this.processModuleResizeResetNotification))
    }
    componentWillUnmount = () =>
    {
        this.observers.forEach(o => o.remove())
        this.observers = null;
    }
    processModuleResizeResetNotification = (...args:any[]) => {
        const arg = args[0] as {id:number, dashboard:number}
        if(arg.dashboard != this.state.dashboard.id)
            return
        const data = {...getProcessedBreakpoint(this.props.category)}
        this.setState(() => {
            return {breakpoints:data.breakpoints, dashboard:data.dashboard, updateKey:uniqueId()}
        })

    }
    processModuleResizeExpandNotification = (...args:any[]) => {
        const arg = args[0] as {id:number, dashboard:number}
        if(arg.dashboard != this.state.dashboard.id)
            return
        const data = {...getProcessedBreakpoint(this.props.category)}
        if(data.dashboard)
        {
            data.dashboard.grid_layouts.forEach(gl => {
                applyGridColumnsParent(gl.columns, null)
            })
            const modules = findModules(data.dashboard.grid_layouts)
            const index = modules.findIndex(m => m.id == arg.id)
            if(index > -1)
            {
                const m = modules.splice(index, 1)
                modules.push(...m)
            }
            modules.forEach(m => {
                let parent = m.parent
                while(!!parent)
                {
                    parent.width = m.id == arg.id ? 12 : 0
                    parent = parent.parent
                }
            })
        }
        this.setState(() => {
            return {breakpoints:data.breakpoints, dashboard:data.dashboard, updateKey:uniqueId()}
        })
    }
    render = () => {
        const {dashboard, breakpoints} = this.state
        if(!dashboard)
            return <div>{translate("dashboard.error.not.found")}</div>
        const key = this.props.updateKey + this.state.updateKey
        return (
            <WindowResponsiveComponent
                breakpoints={breakpoints}
                updateKey={key}
                setClassOnBody={true}
                render={({ breakpoint }) => (
                    <DashboardComponent
                        dashboard={dashboard}
                        breakpoint={breakpoint}
                        updateKey={key}
                    />
            )}/>
        )
    }
}