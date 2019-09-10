import * as React from 'react';
import { connect } from 'react-redux'
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import classnames = require('classnames');
import { UserStatus, UserProfile, UserStatusItem } from '../types/intrasocial_types';
import { WindowAppManager } from '../managers/WindowAppManager';
import { EventStreamMessageType } from '../network/ChannelEventStream';
import { EventStreamManager, EventStreamManagerConnectionChangedEvent } from '../managers/EventStreamManager';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { NavigationUtilities } from '../utilities/NavigationUtilities';
import { ReduxState } from '../redux';
import { OverflowMenuItem, OverflowMenuItemType, createDropdownItem } from './general/OverflowMenu';
import { UserStatusIndicator } from './general/UserStatusIndicator';
import { translate } from '../localization/AutoIntlProvider';
import Routes from '../utilities/Routes';
import { Popover, PopoverBody } from 'reactstrap';
import Avatar from './general/Avatar';
import { userAvatar } from '../utilities/Utilities';
import Popper from 'popper.js';

export const sendUserStatus = (status: UserStatus) => {
    WindowAppManager.sendOutgoingOnSocket(
        JSON.stringify({
            type: EventStreamMessageType.CLIENT_UPDATE,
            data: { status: status }
        })
    );
}
export interface OwnProps {
    className?:string
}
interface ReduxStateProps {
    profile: UserProfile,
    language: number
}
interface ReduxDispatchProps {
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps & RouteComponentProps<any>
export interface State {
    connected: boolean,
    retry: number,
    interval: (NodeJS.Timer | null)
    popoverRemoved:boolean
    popoverVisible:boolean
}
class UserMenu extends React.Component<Props, State> {
    observers: any[] = []
    private triggerRef:HTMLElement = null
    constructor(props: Props) {
        super(props);
        this.state = {
            connected: EventStreamManager.connected,
            retry: 0,
            interval: null,
            popoverRemoved:true,
            popoverVisible:false
        }
    }
    onTriggerClick = (e:React.SyntheticEvent) => {
        e.preventDefault()
        if(!this.state.popoverRemoved)
        {
            this.closePopoverPanel()
        }
        else {
            this.setState( (prevState) => {
                return {popoverRemoved:false, popoverVisible:true}
            })
        }
    }
    closePopoverPanel = () => {
        const completion = () => {
            setTimeout(() => {
                this.setState( (prevState) => {
                    return {popoverVisible:false, popoverRemoved:true}
                })
            }, 300)
        }
        this.setState( (prevState) => {
            return {popoverVisible:false}
        },completion)
    }
    componentDidMount() {
        this.observers.push(NotificationCenter.addObserver(EventStreamManagerConnectionChangedEvent, this.processEventStreamConnectionChange))
    }
    componentWillUnmount() {
        this.observers.forEach(o => o.remove())
        this.observers = null
        this.triggerRef = null
    }
    processEventStreamConnectionChange = (...args: any[]) => {
        const connected = EventStreamManager.connected
        if (this.state.connected != connected) {
            this.setState({ connected })
        }
    }
    setUserStatus = (status: UserStatusItem) => (event: React.SyntheticEvent<any>) => {
        sendUserStatus(status.type);
    }
    signOut = (event: React.SyntheticEvent<any>) => {
        NavigationUtilities.navigateToSignOut(this.props.history);
    }
    navigateToProfile = () => {
        NavigationUtilities.navigateToProfile(this.props.history, this.props.profile);
    }
    renderPopover = () =>
    {
        const open = !this.state.popoverRemoved || this.state.popoverVisible
        if(!open)
            return null
        const currentState = UserStatus.getObject(this.props.profile.user_status)
        const selectable = UserStatus.getSelectableStates([currentState.type])
        const selectableDropdownItems: OverflowMenuItem[] = selectable.map((s, i) => {
            return {
                id: "status_" + i,
                type: OverflowMenuItemType.option,
                title: s.translation(),
                onPress: this.setUserStatus(s),
                toggleMenu: false,
                children: <UserStatusIndicator size={12} borderColor="white" statusColor={s.color} borderWidth={2} />
            }
        })
        selectableDropdownItems.push({id:"divider1", type:OverflowMenuItemType.divider})
        selectableDropdownItems.push({id:"profile", type:OverflowMenuItemType.option, title:translate("common.page.profile"), onPress:this.navigateToProfile})
        selectableDropdownItems.push({id:"all", type:OverflowMenuItemType.option, title:translate("Sign out"), onPress:this.signOut})
        const cn = classnames("dropdown-menu-popover", "user-status-dropdown")
        const modifiers:Popper.Modifiers = {
            flip: { behavior: ['bottom', 'top', 'bottom'] }
          }
        return <Popover className={cn}
                        delay={0}
                        modifiers={modifiers}
                        trigger="legacy"
                        placement="bottom"
                        hideArrow={false}
                        isOpen={this.state.popoverVisible}
                        target={this.triggerRef}
                        toggle={this.closePopoverPanel}
                        >
                    <PopoverBody className="pl-0 pr-0">
                        {selectableDropdownItems.map(i => createDropdownItem(i, this.closePopoverPanel))}
                    </PopoverBody>
                </Popover>
    }
    renderTrigger = () => {
        const profile = this.props.profile
        if (!this.props.profile || this.props.profile.is_anonymous)
            return <Link className="btn btn-sm btn-outline-secondary" to={Routes.SIGNIN}>{translate("Sign in")}</Link>
        return <div ref={(ref) => this.triggerRef = ref} className="trigger d-flex align-items-center">
                    <Avatar onClick={this.onTriggerClick} image={userAvatar(this.props.profile, true)} size={40} userStatus={profile.id}>
                    </Avatar>
                </div>
    }
    render() {
        const cn = classnames("d-flex", this.props.className)
        return (
            <div id="user-menu" className={cn}>
                {this.renderTrigger()}
                {this.renderPopover()}
            </div>
        );
    }
}

const mapStateToProps = (state: ReduxState, ownProps: OwnProps): ReduxStateProps => {
    const profile = state.authentication.profile
    return {
        profile: profile,
        language: state.language.language,
    }
}
export default withRouter(connect<ReduxStateProps, ReduxDispatchProps, OwnProps>(mapStateToProps, null)(UserMenu))
