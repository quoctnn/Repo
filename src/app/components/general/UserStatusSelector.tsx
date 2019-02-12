import * as React from 'react';
import { connect } from 'react-redux'
import { UserStatus, UserProfile } from '../../types/intrasocial_types';
import { sendOnWebsocket, EventStreamMessageType } from '../../network/ChannelEventStream';
import { NotificationCenter } from '../../utilities/NotificationCenter';
import { ReduxState } from '../../redux/index';
import { AuthenticationManager } from '../../managers/AuthenticationManager';
import "./UserStatusSelector.scss"
import { Link } from 'react-router-dom';
import Routes from '../../utilities/Routes';
import { translate } from '../../localization/AutoIntlProvider';

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
const userStatuses:string[] = getEnumValues(UserStatus)
export interface State {
}
let counter = 1
class UserStatusSelector extends React.Component<Props, State> {
    
    observers:any[] = []
    constructor(props:Props) {
        super(props);
    }
    componentDidMount()
    {
        this.processIncomingUserUpdate = this.processIncomingUserUpdate.bind(this)
        const observer = NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.CLIENT_STATUS_CHANGE, this.processIncomingUserUpdate)
        this.observers.push(observer)
    }
    componentWillUnmount()
    {
        this.observers.forEach(o => o.remove())
    }
    processIncomingUserUpdate = (...args:any[]) => {
        let status = args[0]['status'] as UserStatus;
        if(!this.props.profile)
            return
        let profile = Object.assign({}, this.props.profile)
        profile.user_status = status
        AuthenticationManager.setUpdatedProfileStatus(profile)
    }
    setUserStatus = (status:string) =>
    {
        sendUserStatus(status as UserStatus);
        this.setState({userStatus:status});
    }
    renderStatusSelector = () =>
    {
        if(!this.props.profile)
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

            <div className="dropdown margin-right-sm">
                <a data-boundary="body" className="dropdown-toggle text-truncate" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {currentStatus}
                </a>

                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    {selectable.map((status, index) => {
                        return <a key={index} onClick={this.setUserStatus.bind(this, status)} className="dropdown-item" href="#">{status}</a>
                    }) }
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