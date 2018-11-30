import * as React from 'react';
import { connect } from 'react-redux'
import { UserProfile, UserStatus } from '../../reducers/profileStore';
import * as Actions from '../../actions/Actions';
import { sendUserStatus, EventStreamMessageType } from './ChannelEventStream';
import { RootState } from '../../reducers/index';
import { NotificationCenter } from '../../notifications/NotificationCenter';
import { Store, bindActionCreators } from 'redux';
import { setSignedInProfile } from '../../actions/Actions';
require("./UserStatusSelector.scss");

export interface OwnProps
{
}
interface ReduxStateProps
{
    authenticatedProfile:UserProfile|null,
    language:number,
}
type Props = ReduxStateProps & OwnProps
const getEnumValues = (_enum:any) =>
{
    return Object.keys(_enum).map(k => _enum[k])
}
const userStatuses:string[] = getEnumValues(UserStatus)
export interface State {
}
class UserStatusSelector extends React.Component<Props, {}> {
    state:State
    constructor(props) {
        super(props);
        this.processIncomingUserUpdate = this.processIncomingUserUpdate.bind(this)
        this.getStore = this.getStore.bind(this)
    }
    componentDidMount()
    {
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.CLIENT_STATUS_CHANGE, this.processIncomingUserUpdate)
    }
    processIncomingUserUpdate(...args:any[]) {
        let status = args[0]['status'] as UserStatus;
        let profile = Object.assign({}, this.props.authenticatedProfile)
        profile.user_status = status;
        this.getStore().dispatch(Actions.setSignedInProfile(profile))
    }
    setUserStatus(status:string)
    {
        sendUserStatus(status as UserStatus);
        this.setState({userStatus:status});
    }
    renderStatusSelector()
    {
        if(!this.props.authenticatedProfile)
            return null
        const currentStatus = this.props.authenticatedProfile.user_status
        return (

            <div className="dropdown margin-right-sm">
                <button className="btn btn-secondary dropdown-toggle text-truncate" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {currentStatus}
                </button>

                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    {userStatuses.map((status, index) => {
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
    private getStore():Store<RootState,any>
    {
        return window.store
    }
}

const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {
    return {
        authenticatedProfile: state.auth.profile,
        language:state.settings.language,
    }
}
export default connect<ReduxStateProps, void, OwnProps>(mapStateToProps, null)(UserStatusSelector);