import * as React from "react";
import PageHeader from "./components/PageHeader";
import "./Dashboard.scss"
import { ResponsiveBreakpoint } from "./components/general/observers/ResponsiveComponent";
import { Grid } from './components/Grid';
import NewsfeedModule from './modules/newsfeed/NewsfeedModule';
import Module from "./modules/Module";
import ModuleContent from "./modules/ModuleContent";
import ModuleHeader from "./modules/ModuleHeader";
import { Dashboard, GridLayout, Community } from './types/intrasocial_types';
import { connect } from "react-redux";
import { ReduxState } from "./redux";
import TasksModule from "./modules/tasks/TasksModule";

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
        "ProjectModule": TasksModule
    }
    export function getComponent(type: string, props:any) {
        return React.createElement(componentMap[type], props)
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
interface ReduxStateProps
{
    activeCommunity:number
    community:Community
}
interface ReduxDispatchProps
{
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class DashboardComponent extends React.Component<Props, State> {
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
                    <PageHeader community={this.props.community} />
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
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
    const activeCommunity = state.activeCommunity.activeCommunity
    const community = state.communityStore.byId[activeCommunity]
  return {
    activeCommunity,
    community
  }
}
const mapDispatchToProps = (dispatch:any, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(DashboardComponent)

