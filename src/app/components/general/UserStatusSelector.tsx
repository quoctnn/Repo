import * as React from 'react';
import { connect } from 'react-redux'
import { UserStatus, UserProfile } from '../../types/intrasocial_types';
import { sendOnWebsocket, EventStreamMessageType, getStream } from '../../network/ChannelEventStream';
import { NotificationCenter } from '../../utilities/NotificationCenter';
import { ReduxState } from '../../redux/index';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import "./UserStatusSelector.scss"
import { Link } from 'react-router-dom';
import Routes from '../../utilities/Routes';
import { translate } from '../../localization/AutoIntlProvider';
import { EventStreamManagerConnectionChangedEvent, EventStreamManager } from '../../managers/EventStreamManager';
import { StateManager } from 'react-select/lib/stateManager';
import { DropdownItem } from 'reactstrap';

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
const getEnumValues = (_enum:any) =>
{
    return Object.keys(_enum).map(k => _enum[k])
}
const userStatuses:UserStatus[] = getEnumValues(UserStatus)
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
        this.processIncomingUserUpdate = this.processIncomingUserUpdate.bind(this)
        const observer = NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.CLIENT_STATUS_CHANGE, this.processIncomingUserUpdate)
        this.observers.push(observer)
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

    processIncomingUserUpdate = (...args:any[]) => {
        let status = args[0]['status'] as UserStatus;
        if(!this.props.profile)
            return
        let profile = Object.assign({}, this.props.profile)
        profile.user_status = status
        AuthenticationManager.setUpdatedProfileStatus(profile)
    }
    setUserStatus = (status:string) => (event: React.SyntheticEvent<any>) =>
    {
        sendUserStatus(status as UserStatus);
    }
    renderStatusSelector = () =>
    {
        if(!this.props.profile || this.props.profile.is_anonymous)
            return <Link className="btn btn-sm btn-secondary btn-outline-secondary" to={Routes.SIGNIN}>{translate("Sign in")}</Link>
        const currentStatus = this.props.profile.user_status
        let selectable = userStatuses.filter(function(value, _index, _arr){
            if (value === "away" ||
                value === "unavailable")
                return
            else
                return value
        })
        return (
            <div className="d-flex">
                <div className="dropdown margin-right-sm">
                    { this.state.connected &&
                    <a data-boundary="body" className="dropdown-toggle text-truncate" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {currentStatus}
                    </a>
                    ||
                    <span> {UserStatus.unavailable} </span>
                    }
                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        {selectable.map((status, index) => {
                            return <a key={index} onClick={this.setUserStatus(status)} className="dropdown-item" href="#">{translate(status)}</a>
                        }) }
                        <DropdownItem divider={true}/>
                        <Link className="dropdown-item" to={Routes.SIGNOUT}>{translate("Sign out")}</Link>
                    </div>
                </div>
            </div>
        )
    }
    render()
    {
        return(
            <div id="user-status-selector">
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