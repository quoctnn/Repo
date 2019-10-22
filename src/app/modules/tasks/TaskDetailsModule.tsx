import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import ModuleMenuTrigger from '../ModuleMenuTrigger';
import "./TaskDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { Task, Project, Community, ContextNaturalKey, Permission } from '../../types/intrasocial_types';
import { DetailsContent } from '../../components/details/DetailsContent';
import { DetailsMembers, HorisontalLayoutPosition } from '../../components/details/DetailsMembers';
import { withContextData, ContextDataProps } from '../../hoc/WithContextData';
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey: ContextNaturalKey
}
type State = {
    menuVisible:boolean
    isLoading:boolean
}
type Props = OwnProps & RouteComponentProps<any> & ContextDataProps
class TaskDetailsModule extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            menuVisible:false
        }
    }
    componentDidUpdate = (prevProps:Props) => {
        if(prevProps.breakpoint != this.props.breakpoint && this.props.breakpoint < ResponsiveBreakpoint.standard && this.state.isLoading)
        {
            this.setState({isLoading:false})
        }
    }
    menuItemClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const visible = !this.state.menuVisible
        const newState:any = {menuVisible:visible}
        if(!visible)
        {
            /* TODO: Close the modal dialog with the task settings */
        } else {
            /* TODO: Show a modal dialog with the task settings */
        }
        this.setState(newState)
    }
    feedLoadingStateChanged = (isLoading:boolean) => {
        this.setState({isLoading})
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, contextNaturalKey, contextData, ...rest} = this.props
        const {task, project, community} = this.props.contextData
        return (<Module {...rest}>
                        <ModuleHeader className="task-detail" headerTitle={task && task.title || translate("detail.module.title")} loading={this.state.isLoading}>
                            <ModuleMenuTrigger onClick={this.menuItemClick} />
                        </ModuleHeader>
                        {true && //breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                            <>
                                <ModuleContent>
                                { task && task.permission >= Permission.read &&
                                    <div className="task-details-content">
                                        <DetailsContent community={community} description={task.description}>
                                                { project &&
                                                    <div>
                                                        <div className="details-field-name">{translate("common.project.project")}</div>
                                                        <div title={project.name} className="details-field-value text-truncate"><Link to={project.uri}>{project.name}</Link></div>
                                                    </div>
                                                }
                                        </DetailsContent>
                                    </div>
                                }
                                </ModuleContent>
                                <ModuleFooter className="mt-1">
                                    <div className="d-flex flex-row justify-content-between">
                                        { task.responsible &&
                                            <DetailsMembers title={translate('task.responsible')} members={[task.responsible.id]} position={HorisontalLayoutPosition.left} showSeeAll={false}/>
                                        }
                                        { task.assigned_to && task.assigned_to.length > 0 &&
                                            <DetailsMembers title={translate('task.assigned_to')} members={task.assigned_to.map((user) => {return user.id})} position={HorisontalLayoutPosition.right} showSeeAll={false}/>
                                        }
                                    </div>
                                </ModuleFooter>
                            </>
                        }
                </Module>)
    }
}
export default withContextData(withRouter(TaskDetailsModule))