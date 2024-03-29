import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from "react-router-dom";
import Module from '../Module';
import ModuleHeader from '../ModuleHeader';
import ModuleContent from '../ModuleContent';
import ModuleFooter from '../ModuleFooter';
import "./EventDetailsModule.scss"
import { ResponsiveBreakpoint } from '../../components/general/observers/ResponsiveComponent';
import { translate } from '../../localization/AutoIntlProvider';
import { Event, ContextNaturalKey, Permission } from '../../types/intrasocial_types';
import CircularLoadingSpinner from '../../components/general/CircularLoadingSpinner';
import { DetailsContent } from '../../components/details/DetailsContent';
import { stringToDateFormat, DateFormat, uniqueId } from '../../utilities/Utilities';
import { OverflowMenuItem, OverflowMenuItemType } from '../../components/general/OverflowMenu';
import FormController from '../../components/form/FormController';
import { DropDownMenu } from '../../components/general/DropDownMenu';
import EventCreateComponent from '../../components/general/contextCreation/EventCreateComponent';
import ContextMembersForm from '../../components/general/contextMembers/ContextMembersForm';
import ContextMembershipComponent from '../../components/general/contextMembership/ContextMembershipComponent';
import { withContextData, ContextDataProps } from '../../hoc/WithContextData';
import { EventController } from '../../managers/EventController';
import ContextConfirmableActionsComponent, { ContextConfirmableActions } from '../../components/general/context/ContextConfirmableActionsComponent';
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
    membersFormVisible?:boolean
    membersFormReloadKey?:string
}
type Props = OwnProps & RouteComponentProps<any> & ContextDataProps
class EventDetailsModule extends React.Component<Props, State> {
    formController:FormController = null
    confirmActionComponent = React.createRef<ContextConfirmableActionsComponent>()
    constructor(props:Props) {
        super(props);
        this.state = {
            isLoading:false,
            menuVisible:false,
            editFormVisible:false,
            editFormReloadKey:uniqueId(),
            membersFormVisible:false,
            membersFormReloadKey:uniqueId(),
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
            EventController.partialUpdate(event)
        }
        this.hideEventCreateForm()
    }
    toggleMembersForm = () => {
        this.setState((prevState:State) => {
            const invitationReloadKey = prevState.membersFormVisible ? null : uniqueId()
            return {membersFormVisible:!prevState.membersFormVisible, membersFormReloadKey: invitationReloadKey}
        })
    }
    showConfirmDeleteDialog = () => {
        this.confirmActionComponent && this.confirmActionComponent.current && this.confirmActionComponent.current.showAction(ContextConfirmableActions.delete)
    }
    showConfirmLeaveDialog = () => {
        this.confirmActionComponent && this.confirmActionComponent.current && this.confirmActionComponent.current.showAction(ContextConfirmableActions.leave)
    }
    toggleMute = () => {
        const action = this.props.contextData.event.muted ? ContextConfirmableActions.unmute : ContextConfirmableActions.mute
        this.confirmActionComponent && this.confirmActionComponent.current && this.confirmActionComponent.current.showAction(action, false)
    }
    getEventOptions = () => {
        const authenticatedUser = this.props.contextData.authenticatedUser
        const options: OverflowMenuItem[] = []
        const {event} = this.props.contextData
        const attending = event.attending || []
        if(event.permission >= Permission.moderate)
        {
            options.push({id:"edit", type:OverflowMenuItemType.option, title:translate("Edit"), onPress:this.showEventCreateForm, iconClass:"fas fa-pen", iconStackClass:Permission.getShield(event.permission)})
            options.push({id:"members", type:OverflowMenuItemType.option, title:translate("common.member.management"), onPress:this.toggleMembersForm, iconClass:"fas fa-users-cog", iconStackClass:Permission.getShield(event.permission)})
            options.push({id:"delete", type:OverflowMenuItemType.option, title:translate("common.delete"), onPress:this.showConfirmDeleteDialog, iconClass:"fas fa-trash-alt", iconStackClass:Permission.getShield(event.permission)})
        }
        if(attending.contains(authenticatedUser.id))
        {
            if(event.muted)
                options.push({id:"unmute", type:OverflowMenuItemType.option, title:translate("common.unmute"), onPress:this.toggleMute, iconClass:"fas fa-bell-slash"})
            else
                options.push({id:"mute", type:OverflowMenuItemType.option, title:translate("common.mute"), onPress:this.toggleMute, iconClass:"fas fa-bell"})
        }
        if(event.creator != authenticatedUser.id && attending.contains(authenticatedUser.id))
            options.push({id:"leave", type:OverflowMenuItemType.option, title:translate("common.leave"), onPress:this.showConfirmLeaveDialog, iconClass:"fas fa-sign-out-alt"})
        return options
    }
    renderMembersForm = () => {
        const visible = this.state.membersFormVisible
        const {community, event} = this.props.contextData
        return <ContextMembersForm community={community} contextNaturalKey={ContextNaturalKey.EVENT} key={this.state.membersFormReloadKey} didCancel={this.toggleMembersForm} visible={visible} contextObject={event} />
    }
    renderEditForm = () => {
        const visible = this.state.editFormVisible
        const {event} = this.props.contextData
        return <EventCreateComponent onCancel={this.hideEventCreateForm} community={event.community} key={this.state.editFormReloadKey} event={event} visible={visible} onComplete={this.handleEventCreateForm} />
    }
    handleConfirmableActionComplete = (action:ContextConfirmableActions, contextNaturalKey:ContextNaturalKey, contextObjectId:number) => {
        this.props.contextData.reloadContextObject(contextObjectId, contextNaturalKey)
    }
    render()
    {
        const {breakpoint, history, match, location, staticContext, contextNaturalKey, contextData, ...rest} = this.props
        const {community, event} = this.props.contextData
        if(!community || !event)
            return null
        const startDate = event ? new Date(event.start) : null
        const eventOptions = this.getEventOptions()
        return (<Module {...rest}>
                    <ModuleHeader className="event-detail" headerTitle={event && event.name || translate("detail.module.title")} loading={this.state.isLoading}>
                        {eventOptions.length > 0 && <DropDownMenu className="event-option-dropdown" triggerClass="fas fa-cog fa-2x mx-1" items={eventOptions}></DropDownMenu>}
                    </ModuleHeader>
                    <ModuleContent>
                        <div className="event-details-content">
                            <DetailsContent community={community} group={event.group} description={event.description}>
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
                        {this.renderEditForm()}
                        {this.renderMembersForm()}
                        <ContextConfirmableActionsComponent ref={this.confirmActionComponent} contextNaturalKey={ContextNaturalKey.EVENT} contextObject={event} onActionComplete={this.handleConfirmableActionComplete} />
                    </ModuleContent>
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
                        <ContextMembershipComponent contextNaturalKey={ContextNaturalKey.EVENT} contextObject={event} />
                    </ModuleFooter>
                </Module>)
    }
}
export default withContextData(withRouter(EventDetailsModule))