import * as React from 'react';
import { connect } from 'react-redux'
import { UserStatus, UserProfile, UserStatusItem } from '../../types/intrasocial_types';
import { sendOnWebsocket, EventStreamMessageType } from '../../network/ChannelEventStream';
import { NotificationCenter } from '../../utilities/NotificationCenter';
import { ReduxState } from '../../redux/index';
import "./UserStatusSelector.scss"
import { Link } from 'react-router-dom';
import Routes from '../../utilities/Routes';
import { translate } from '../../localization/AutoIntlProvider';
import { EventStreamManagerConnectionChangedEvent, EventStreamManager } from '../../managers/EventStreamManager';
import { DropdownItem } from 'reactstrap';
import { UserStatusIndicator } from './UserStatusIndicator';
import { OverflowMenuItem, OverflowMenuItemType, createDropdownItem } from './OverflowMenu';

export const sendUserStatus = (status: UserStatus) => {
    sendOnWebsocket(
        JSON.stringify({
        type: EventStreamMessageType.USER_UPDATE,
        data: { status: status }
        })
    );
}
export interface OwnProps
{
}
interface ReduxStateProps
{
    profile:UserProfile|null,
    language:number,
    count:number
}
type Props = ReduxStateProps & OwnProps
export interface State {
    connected:boolean,
    retry:number,
    interval: (NodeJS.Timer|null)
}
let counter = 1
class UserStatusSelector extends React.Component<Props, State> {

    observers:any[] = []
    constructor(props:Props) {
        super(props);
        this.state = {
            connected : EventStreamManager.connected,
            retry : 0,
            interval : null
        }
    }
    componentDidMount()
    {
        this.observers.push( NotificationCenter.addObserver(EventStreamManagerConnectionChangedEvent, this.processEventStreamConnectionChange ))
    }
    componentWillUnmount()
    {
        this.observers.forEach(o => o.remove())
    }
    processEventStreamConnectionChange = (...args:any[]) => {
        const connected = EventStreamManager.connected
        if(this.state.connected != connected) {
            this.setState({connected})
        }
    }
    setUserStatus = (status:UserStatusItem) => (event: React.SyntheticEvent<any>) =>
    {
        sendUserStatus(status.type);
    }
    signOut = () => (event: React.SyntheticEvent<any>) =>
    {
        // navigate to Route SignOut
        window.location.replace(Routes.SIGNOUT)
    }
    renderStatusSelector = () =>
    {
        if(!this.props.profile || this.props.profile.is_anonymous)
            return <Link className="btn btn-sm btn-secondary btn-outline-secondary" to={Routes.SIGNIN}>{translate("Sign in")}</Link>
        const currentState = UserStatus.getObject(this.props.profile.user_status)
        const selectable = UserStatus.getSelectableStates([currentState.type])
        const selectableDropdownItems:OverflowMenuItem[] = selectable.map((s, i) => {
         return {id:"status_" + i,
                type:OverflowMenuItemType.option,
                title:s.translation(),
                onPress:this.setUserStatus(s),
                toggleMenu:false,
                children:<UserStatusIndicator size={12} borderColor="white" statusColor={s.color} borderWidth={2} />
            }
        })
        return (
            <div className="m-2">
                <div className="dropdown margin-right-sm d-flex">
                    {this.state.connected &&
                    <a data-boundary="body" className="dropdown-toggle text-truncate" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {currentState.translation()}
                    </a>
                    ||
                    <span> {UserStatus.getObject(UserStatus.unavailable).translation()} </span>
                    }
                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        {selectableDropdownItems.map((dd, index) => {
                            return createDropdownItem(dd)
                        }) }
                        <DropdownItem divider={true}/>
                        <DropdownItem title={translate("Sign out")} toggle={false} onClick={this.signOut()}>{translate("Sign out")}</DropdownItem>
                    </div>
                </div>
            </div>
        )
    }
    render()
    {
        return(
            <div id="user-status-selector" className="d-flex">
                <div className="flex-grow-1"></div>
                {this.renderStatusSelector()}
            </div>
        );
    }
}

const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => {
    const profile = state.authentication.profile
    const c = counter
    counter++
    return {
        profile:profile ,
        count:c,
        language:state.language.language,
    }
}
export default connect<ReduxStateProps, void, OwnProps>(mapStateToProps, null)(UserStatusSelector)