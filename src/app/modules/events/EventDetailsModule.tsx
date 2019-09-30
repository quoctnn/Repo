import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import "./EventDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { Event, Community, ContextNaturalKey, Permission} from '../../types/intrasocial_types';
import { connect } from 'react-redux';
import { ReduxState } from '../../redux';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DetailsContent } from '../../components/details/DetailsContent';
import { stringToDateFormat, DateFormat, uniqueId } from '../../utilities/Utilities';
import { ContextManager } from '../../managers/ContextManager';
import { OverflowMenuItem, OverflowMenuItemType } from '../../components/general/OverflowMenu';
import FormController from '../../components/form/FormController';
import { DropDownMenu } from '../../components/general/DropDownMenu';
import EventCreateComponent from '../../components/general/contextCreation/EventCreateComponent';
import { EventManager } from '../../managers/EventManager';
const shortMonth:string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
type OwnProps = {
    breakpoint:ResponsiveBreakpoint
    contextNaturalKey: ContextNaturalKey
}
type State = {
    menuVisible:boolean
    isLoading:boolean
    editFormVisible:boolean
    editFormReloadKey:string
}
type ReduxStateProps = {
    community: Community
    event: Event
}
type ReduxDispatchProps = {
}
type Props = OwnProps & RouteComponentProps<any> & ReduxStateProps & ReduxDispatchProps
class EventDetailsModule extends React.Component<Props, State> {
    formController:FormController = null
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            menuVisible:false,
            editFormVisible:false,
            editFormReloadKey:uniqueId(),
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
            /* TODO: Close the modal dialog with the event settings */
        } else {
            /* TODO: Show a modal dialog with the event settings */
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
    showEventCreateForm = () => {
        this.setState((prevState:State) => {
            return {editFormVisible:true, editFormReloadKey:uniqueId()}
        })
    }
    hideEventCreateForm = () => {

        this.setState((prevState:State) => {
            return {editFormVisible:false}
        })
    }
    handleEventCreateForm = (event:Event) => {

        if(!!event)
        {
            EventManager.storeEvents([event])
        }
        this.hideEventCreateForm()
    }
    getEventOptions = () => {
        const options: OverflowMenuItem[] = []
        if(this.props.event.permission >= Permission.admin)
            options.push({id:"1", type:OverflowMenuItemType.option, title:translate("Edit"), onPress:this.showEventCreateForm, iconClass:"fas fa-pen", iconStackClass:Permission.getShield(this.props.event.permission)})
        return options
    }
    renderEditForm = () => {
        const visible = this.state.editFormVisible
        const event = this.props.event
        return <EventCreateComponent onCancel={this.hideEventCreateForm} community={event.community} key={this.state.editFormReloadKey} event={event} visible={visible} onComplete={this.handleEventCreateForm} />
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, event, community, contextNaturalKey, ...rest} = this.props
        const startDate = event ? new Date(event.start) : null
        const eventOptions = this.getEventOptions()
        return (<Module {...rest}>
                    <ModuleHeader className="event-detail" headerTitle={event && event.name || translate("detail.module.title")} loading={this.state.isLoading}>
                        {eventOptions.length > 0 && <DropDownMenu className="event-option-dropdown" triggerClass="fas fa-cog mx-1" items={eventOptions}></DropDownMenu>} 
                    </ModuleHeader>
                    {true && //breakpoint >= ResponsiveBreakpoint.standard && //do not render for small screens
                        <ModuleContent>
                            { event && event.permission >= Permission.read &&
                                <div className="event-details-content">
                                    <DetailsContent community={community} description={event.description}>
                                        { event.parent &&
                                            <div>
                                                <span className="details-field-name">
                                                    {translate("common.event.event")}:&nbsp;
                                                </span>
                                                <span className="details-field-value">
                                                    <Link to={event.parent.uri || "#"}>
                                                        {event.parent.name}
                                                    </Link>
                                                </span>
                                            </div>
                                        }
                                    </DetailsContent>
                                </div>
                                ||
                                <LoadingSpinner key="loading"/>
                            }
                            {this.renderEditForm()}
                        </ModuleContent>
                    }
                    { event && event.permission >= Permission.read &&
                        <ModuleFooter>
                            { startDate &&
                            <div className="event-footer">
                                <div className="event-date-big">
                                        <span>
                                            {shortMonth[startDate.getMonth()].toUpperCase()}<br/>
                                            {startDate.getDate()}
                                        </span>
                                </div>
                                <div className="event-start-end text-truncate">
                                    <div className="details-field-value">
                                        {stringToDateFormat(event.start, DateFormat.date)}
                                        &nbsp;-<br/>
                                        {stringToDateFormat(event.end, DateFormat.date)}
                                    </div>
                                </div>
                            </div>
                            }
                        </ModuleFooter>
                    }
                </Module>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps & RouteComponentProps<any>):ReduxStateProps => {
    const event = ContextManager.getContextObject(ownProps.location.pathname, ownProps.contextNaturalKey) as Event
    const community = ContextManager.getContextObject(ownProps.location.pathname, ContextNaturalKey.COMMUNITY) as Community
    return {
        community,
        event,
    }
}
const mapDispatchToProps = (dispatch:ReduxState, ownProps: OwnProps):ReduxDispatchProps => {
    return {
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(EventDetailsModule))