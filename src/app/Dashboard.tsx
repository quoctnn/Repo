import * as React from "react";
import { PageHeader } from "./components/PageHeader";
import PageTopNavigation from "./components/PageTopNavigation";
import "./Dashboard.scss"
import { ResponsiveBreakpoint } from "./components/ResponsiveComponent";
import { Grid } from './components/Grid';
import WindowResponsiveComponent from "./components/WindowResponsiveComponent";
import NewsfeedModule from './modules/NewsfeedModule';
import Module from "./modules/Module";
import ModuleContent from "./modules/ModuleContent";
import ModuleHeader from "./modules/ModuleHeader";

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
        "NewsfeedModule":NewsfeedModule
    }
    export function getComponent(type: string, props:any) {
        return React.createElement(componentMap[type], props)
    }
}
export type DashboardComponent = {
    id:number
    component:string
    position:number
    props:any
}
export type DashboardGridPosition = {
    id:number
    columnStart:number
    columnSpan:number
    rowStart:number
    rowSpan:number
}
export type DashboardGrid = {
    mobile:DashboardGridPosition[]
    desktop:DashboardGridPosition[]
}
type Props = 
{
    grid:DashboardGrid
    components:DashboardComponent[]
    breakpoint:ResponsiveBreakpoint
}
type State = {
    defaultGrid:DashboardGridPosition[]
}

export class Dashboard extends React.Component<Props, State> {
    constructor(props:Props)
    {
        super(props)
        const l = this.getGridLayoutForBreakpoint(props.grid, ResponsiveBreakpoint.Micro, true)
        const grid = l.map(m => Object.assign({},m))
        let rowStart = 1
        grid.forEach((m) => {
            m.columnStart = 1
            m.rowStart = rowStart
            m.columnSpan = 12
            rowStart += m.rowSpan
        })
        this.state = {
            defaultGrid:grid
        }
    }
    renderModules = () => 
    {
        const grid = this.getGridLayoutForBreakpoint(this.props.grid, this.props.breakpoint)
        return (<Grid breakpoint={this.props.breakpoint} components={this.props.components} grid={grid} enableAnimation={true} />)
    }
    getGridLayoutForBreakpoint = (grid: DashboardGrid, breakpoint:ResponsiveBreakpoint, useFirstAsFallback:boolean = false):DashboardGridPosition[] =>
    {
        let layout:DashboardGridPosition[]
        if(breakpoint >= ResponsiveBreakpoint.Big)
        {
            layout = grid.desktop
            if(layout)
                return layout
        }
        else if(breakpoint >= ResponsiveBreakpoint.Standard)
        {
            layout = grid.mobile
        }
        return layout || (useFirstAsFallback ? grid[Object.keys(grid)[0]] : this.state.defaultGrid)
    }
    renderContent = () => {
        return (<>
                    <PageHeader />
                    <PageTopNavigation />
                    <div className="dashboard-components m-2 m-sm-3 m-md-4">
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
    const grid = { 
                desktop:[
                    {id:1, columnStart:1, rowStart:1, columnSpan:12, rowSpan:3},
                    {id:2, columnStart:1, rowStart:4, columnSpan:6, rowSpan:2},
                    {id:3, columnStart:7, rowStart:4, columnSpan:6, rowSpan:2},
                    ],
                mobile:[
                    {id:1, columnStart:1, rowStart:1, columnSpan:12, rowSpan:2},
                    {id:2, columnStart:1, rowStart:3, columnSpan:12, rowSpan:2},
                    {id:3, columnStart:1, rowStart:5, columnSpan:12, rowSpan:2},
                    ]
    }
    const components = [
        {id:1, component:"NewsfeedModule", position:1, props:{text:"1"}},
        {id:2, component:"DemoComponent", position:2, props:{text:"22"}},
        {id:3, component:"DemoComponent", position:3, props:{text:"33"}}
    ]
    return (

        <WindowResponsiveComponent setClassOnBody={true} render={({ breakpoint }) => (
            <Dashboard 
                breakpoint={breakpoint}
                grid={grid}
                components={components}
            />
        )}/>
    );
  }
