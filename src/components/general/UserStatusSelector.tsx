import * as React from 'react';
import { connect } from 'react-redux'
import { UserProfile, UserStatus } from '../../reducers/profileStore';
import { sendUserStatus } from './ChannelEventStream';
import { type } from 'os';
import profile from '../../reducers/profile';
require("./UserStatusSelector.scss");

export interface Props {
    profile:UserProfile,
    language:number,
}
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
    }
    setUserStatus(status:string)
    {
        sendUserStatus(status as UserStatus)
        this.setState({userStatus:status})
    }
    renderStatusSelector()
    {
        return (
            
            <div className="dropdown margin-right-sm">
                <button className="btn btn-secondary dropdown-toggle text-truncate" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {this.props.profile.user_status}
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
}

const mapStateToProps = (state) => {
    return {
        profile: state.profile,
        language:state.settings.language
    };
}
export default connect(mapStateToProps, null)(UserStatusSelector);