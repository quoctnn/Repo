import * as React from "react";
import PageHeader from "./components/PageHeader";
import PageTopNavigation from "./components/PageTopNavigation";
import "./Dashboard.scss"
import { ResponsiveBreakpoint } from "./components/general/observers/ResponsiveComponent";
import { Grid } from './components/Grid';
import WindowResponsiveComponent from "./components/general/observers/WindowResponsiveComponent";
import NewsfeedModule from './modules/newsfeed/NewsfeedModule';
import Module from "./modules/Module";
import ModuleContent from "./modules/ModuleContent";
import ModuleHeader from "./modules/ModuleHeader";
import ProjectModule from "./modules/project/ProjectModule";
import { ApplicationManager } from './managers/ApplicationManager';
import { Dashboard, GridLayout } from './types/intrasocial_types';

type DemoProps = {
    text?:string
}
class DemoComponent extends React.Component<DemoProps, {}> {

    constructor(props:DemoProps){
        super(props)
    }
    render = () => {
        const {text, ...rest} = this.props
        return <Module {...rest}>
                <ModuleHeader>Header</ModuleHeader>
                <ModuleContent>{this.props.text || "Test"}</ModuleContent>
                </Module>
    }
}
export namespace DashboardComponents {
    export const componentMap = {
        "DemoComponent": DemoComponent,
        "NewsfeedModule":NewsfeedModule,
        "ProjectModule": ProjectModule
    }
    export function getComponent(type: string, props:any) {
        return React.createElement(componentMap[type], props)
    }
}
type Props =
{
    breakpoint:number
    dashboard:Dashboard
}
type State = {
    defaultGrid:GridLayout
}

export class DashboardComponent extends React.Component<Props, State> {
    constructor(props:Props)
    {
        super(props)
        const grid = {...this.findGridLayout(0, false), id:-1, min_width:ResponsiveBreakpoint.standard}
        grid.grid_modules = grid.grid_modules.map(m => {return {...m, module:{...m.module}}})
        let rowStart = 1
        grid.grid_modules.forEach(m => {
            m.column = 1
            m.row = rowStart
            m.width = 12
            rowStart += m.height
        })
        this.state = {
            defaultGrid:grid,
        }
    }
    renderModules = () =>
    {
        const grid = this.findGridLayout(this.props.breakpoint, true)
        const fill = this.props.breakpoint > ResponsiveBreakpoint.standard && grid.fill
        return (<Grid fill={fill} grid={grid} breakpoint={this.props.breakpoint} enableAnimation={true} />)
    }
    findGridLayout = (breakpoint: number, useDefaultAsFallback:boolean) => {

        let ret = this.props.dashboard.grid_layouts.find(i => {
            return breakpoint >= i.min_width
        })
        ret = ret || (useDefaultAsFallback ? this.state.defaultGrid : this.props.dashboard.grid_layouts[this.props.dashboard.grid_layouts.length - 1])
        console.log("resolving:", breakpoint,"got:", ret)
        return ret
    }
    renderContent = () => {
        return (<>
                    <PageHeader>
                        <PageTopNavigation />
                    </PageHeader>
                    <div className="dashboard-components m-2 m-sm-3 m-md-3">
                        {this.renderModules()}
                    </div>
                </>)
    }
    render() {

        return(
            <div id="dashboard">
                    {this.renderContent()}
            </div>

        );
    }
}
export const DashCompWithData = (props:any) => {
    const dashboards = ApplicationManager.getDashboards()
    const dashboard = dashboards[0]
    dashboard.grid_layouts = dashboard.grid_layouts.sort((a, b) => b.min_width - a.min_width) //descending
    let breakpoints = dashboard.grid_layouts.map(l => l.min_width).filter(b => b > ResponsiveBreakpoint.standard)
    breakpoints.push(ResponsiveBreakpoint.standard)
    breakpoints.push(ResponsiveBreakpoint.mini)
    breakpoints = breakpoints.sort((a, b) => b - a) //descending
    return (

        <WindowResponsiveComponent breakpoints={breakpoints} setClassOnBody={true} render={({ breakpoint }) => (
            <DashboardComponent
                dashboard={dashboard}
                breakpoint={breakpoint}
            />
        )}/>
    );
  }
