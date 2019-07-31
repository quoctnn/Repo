import * as React from "react";
import "./Dashboard.scss"
import { ResponsiveBreakpoint } from "./components/general/observers/ResponsiveComponent";
import { Grid } from './components/Grid';
import NewsfeedModule from './modules/newsfeed/NewsfeedModule';
import Module from "./modules/Module";
import ModuleContent from "./modules/ModuleContent";
import ModuleHeader from "./modules/ModuleHeader";
import { Dashboard, GridColumns, GridColumn } from './types/intrasocial_types';
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
import ConversationModule from "./modules/conversation/ConversationModule";
import ActivityModule from "./modules/activity/ActivityModule";
import CoverModule from "./modules/cover/CoverModule";
import ContactsModule from "./modules/contacts/ContactsModule";
import { AuthenticationManager } from "./managers/AuthenticationManager";
import { NavigationUtilities } from './utilities/NavigationUtilities';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { EndpointManager } from './managers/EndpointManager';

type DemoProps = {
    text?:string
    height?:number
}

class DemoComponent extends React.Component<DemoProps, {}> {

    constructor(props:DemoProps){
        super(props)
    }
    render = () => {
        const {text, height, ...rest} = this.props
        return <Module {...rest} style={{height:height}}>
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
        "ConversationModule":ConversationModule,
        "RecentActivityModule":ActivityModule,
        "CoverModule":CoverModule,
        "ContactsModule":ContactsModule,
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
    updateKey?:string
}
type State = {
    defaultGrid:GridColumns
}
type Props = OwnProps & RouteComponentProps<any>

class DashboardComponent extends React.Component<Props, State> {
    constructor(props:Props)
    {
        super(props)
        const grid = {...this.findGridLayout(0, false), id:-1, min_width:ResponsiveBreakpoint.standard}
        const gridColumns:GridColumn[] = []
        const loop = (columns:GridColumn[]) => {
            columns.forEach(c => {
                if(c.module)
                {
                    const clone = {...c, module:{...c.module}}
                    clone.width = 12
                    gridColumns.push(clone)
                }
                else
                    loop(c.children)
            })
        }
        loop(grid.columns || [])
        grid.title += "_generated"
        grid.columns = gridColumns
        this.state = {
            defaultGrid:grid,
        }
    }
    countModules = (columns:GridColumn[] = []):number => {
        let cnt = 0
        columns.forEach(c => {
            cnt += this.countModules(c.children || []) + (c.module ? 1 : 0)
        })
        return cnt
    }
    componentDidMount = () => {
        const profile = AuthenticationManager.getAuthenticatedUser()
        if (profile && profile.is_anonymous) {
            const endpoint = EndpointManager.currentEndpoint()
            if (this.props.history.location.pathname == "/")
                NavigationUtilities.navigateToCommunity(this.props.history, endpoint.defaultCommunity)
        }
    }
    renderModules = () =>
    {
        const grid = this.findGridLayout(this.props.breakpoint, true)
        const modulesCount = this.countModules( grid.columns || [])
        const fill = (modulesCount == 1 || this.props.breakpoint > ResponsiveBreakpoint.standard) && grid.fill
        return (<Grid updateKey={this.props.updateKey} fill={fill} grid={grid} breakpoint={this.props.breakpoint} enableAnimation={true} />)
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
                    <div className="dashboard-components">
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
export default withRouter(DashboardComponent)