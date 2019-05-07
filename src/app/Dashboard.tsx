import * as React from "react";
import "./Dashboard.scss"
import { ResponsiveBreakpoint } from "./components/general/observers/ResponsiveComponent";
import { Grid } from './components/Grid';
import NewsfeedModule from './modules/newsfeed/NewsfeedModule';
import Module from "./modules/Module";
import ModuleContent from "./modules/ModuleContent";
import ModuleHeader from "./modules/ModuleHeader";
import { Dashboard, GridLayout } from './types/intrasocial_types';
import TasksModule from "./modules/tasks/TasksModule";
import GroupsModule from "./modules/groups/GroupsModule";
import GroupDetailsModule from "./modules/groups/GroupDetailsModule";
import ProjectsModule from "./modules/projects/ProjectsModule";
import EventsModule from "./modules/events/EventsModule";
import LocationModule from "./modules/location/LocationModule";
import ProjectDetailsModule from "./modules/projects/ProjectDetailsModule";
import EventDetailsModule from "./modules/events/EventDetailsModule";
import TimesheetModule from "./modules/timesheet/TimesheetModule";
import FilesModule from "./modules/files/FilesModule";
import CommunitiesModule from "./modules/communities/CommunitiesModule";
import CommunityDetailsModule from "./modules/communities/CommunityDetailsModule";
import ConversationsModule from "./modules/conversations/ConversationsModule";
import TaskDetailsModule from "./modules/tasks/TaskDetailsModule";
import ActivityModule from "./modules/activity/ActivityModule";

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
                <ModuleHeader headerTitle={"Header"}></ModuleHeader>
                <ModuleContent>{this.props.text || "Test"}</ModuleContent>
                </Module>
    }
}
export namespace DashboardComponents {
    export const componentMap = {
        "DemoComponent": DemoComponent,
        "NewsfeedModule":NewsfeedModule,
        "CommunitiesModule":CommunitiesModule,
        "CommunityDetailsModule":CommunityDetailsModule,
        "TaskModule": TasksModule,
        "TaskDetailsModule": TaskDetailsModule,
        "GroupsModule":GroupsModule,
        "GroupDetailsModule":GroupDetailsModule,
        "ProjectsModule":ProjectsModule,
        "ProjectDetailsModule":ProjectDetailsModule,
        "EventsModule":EventsModule,
        "EventDetailsModule":EventDetailsModule,
        "LocationModule":LocationModule,
        "TimesheetModule":TimesheetModule,
        "FilesModule":FilesModule,
        "ConversationsModule":ConversationsModule,
        "RecentActivityModule":ActivityModule
    }
    export function getComponent(type: string, props:any) {
        const comp = componentMap[type]
        if(comp)
            return React.createElement(comp, props)
        else {
            console.error("Module '"+ type +"' is not a valid module type")
            return null
        }
    }
}
type OwnProps =
{
    breakpoint:number
    dashboard:Dashboard
}
type State = {
    defaultGrid:GridLayout
}
type Props = OwnProps
export default class DashboardComponent extends React.Component<Props, State> {
    constructor(props:Props)
    {
        super(props)
        const grid = {...this.findGridLayout(0, false), id:-1, min_width:ResponsiveBreakpoint.standard}
        grid.grid_modules = (grid.grid_modules || []).map(m => {return {...m, module:{...m.module}}})
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
