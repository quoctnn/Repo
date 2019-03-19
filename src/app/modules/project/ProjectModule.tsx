import * as React from 'react';
import { withRouter, RouteComponentProps } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import classnames from "classnames"
import "./ProjectModule.scss"
import ModuleMenu from '../ModuleMenu';
import ModuleMenuTrigger from '../ModuleMenuTrigger';
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import ProjectMenu, { ProjectMenuData } from './ProjectMenu';
import ProjectComponent from './ProjectComponent';
import ModuleFooter from '../ModuleFooter';
import { Badge } from 'reactstrap';

type OwnProps = {
    className?:string
    breakpoint:ResponsiveBreakpoint
}
type State = {
    menuVisible:boolean
    isLoading:boolean
    menuData:ProjectMenuData
}
type Props = OwnProps & RouteComponentProps<any>
class ProjectModule extends React.Component<Props, State> {  
    tempMenuData:ProjectMenuData = null   
    constructor(props:Props) {
        super(props);
        this.state = {
            menuVisible:false,
            isLoading:false,
            menuData:{
                project:null,
                state: [],
                priority: [],
                assignedTo: null,
                responsible: null,
                tags: [],
                category: null,
                term: null,
                creator:null,
                notAssigned:null,
            }
        }
    }
    componentDidUpdate = (prevProps:Props) => {
        //turn off loading spinner if feed is removed
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    headerClick = (e) => {
        const context = this.state.menuData.project
        //NavigationUtilities.navigateToNewsfeed(this.props.history, context && context.type, context && context.id, this.state.includeSubContext)
    }
    menuItemClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const visible = !this.state.menuVisible
        const newState:any = {menuVisible:visible}
        if(!visible && this.tempMenuData)
        {
            newState.menuData = this.tempMenuData
            this.tempMenuData = null
        }
        this.setState(newState)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    renderLoading = () => {
        if (this.state.isLoading) {
            return (<CircularLoadingSpinner borderWidth={3} size={20} key="loading"/>)
        }
    }
    menuDataUpdated = (data:ProjectMenuData) => {
        this.tempMenuData = data
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, className,  ...rest} = this.props
        const cn = classnames("project-module", className, {"menu-visible":this.state.menuVisible})
        const headerClick = breakpoint < ResponsiveBreakpoint.standard ? this.headerClick : undefined
        const headerClass = classnames({link:headerClick})
        const headerSubtitle = this.state.menuData.project && this.state.menuData.project.label
        return (<Module {...rest} className={cn}>
                    <ModuleHeader className={headerClass} onClick={headerClick}>
                        <div className="flex-grow-1 text-truncate d-flex align-items-center">
                            <div className="text-truncate module-header-title-left">{translate("project.module.title")}</div>
                            {this.renderLoading()}
                            <div className="spacer flex-grow-1 flex-shrink-1"></div>
                            {!!headerSubtitle && 
                                <div className="module-header-title-right text-truncate">{headerSubtitle}</div>
                            }
                        </div>
                        <ModuleMenuTrigger onClick={this.menuItemClick} />
                    </ModuleHeader>
                    {breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <>
                            <ModuleContent>
                                <ProjectComponent 
                                    onLoadingStateChanged={this.feedLoadingStateChanged}  
                                    contextData={this.state.menuData}
                                    />
                            </ModuleContent>
                        </>
                    }
                    <ModuleMenu visible={this.state.menuVisible}>
                        <ProjectMenu 
                            data={this.state.menuData}
                            onUpdate={this.menuDataUpdated}  />
                    </ModuleMenu>
                </Module>)
    }
}
export default withRouter(ProjectModule)