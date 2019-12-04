import * as React from "react";
import { UserProfile } from '../../../../types/intrasocial_types';
import { EventSubscription } from "fbemitter";
import { NotificationCenter } from "../../../../utilities/NotificationCenter";
import { EventStreamMessageType } from "../../../../network/ChannelEventStream";
import { Settings } from "../../../../utilities/Settings";
import { ReduxState } from "../../../../redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Routes from "../../../../utilities/Routes";
import "./ContextListItem.scss";
import UserProfileAvatar from "../../../general/UserProfileAvatar";
import { TypingIndicator } from "../../../general/TypingIndicator";
import classnames from 'classnames';
import { ContextDataProps, withContextData } from "../../../../hoc/WithContextData";

type OwnProps = {
    contact: UserProfile
    onClick?: (e: React.MouseEvent) => void
}

type State = {
    isTyping:any
}

type ReduxStateProps = {
    authenticatedUser:UserProfile
}

type Props = ReduxStateProps & ContextDataProps & OwnProps

class ContactListItem extends React.PureComponent<Props, State> {
    private observers:EventSubscription[] = []
    constructor(props:Props) {
        super(props)
        this.state = {
            isTyping: {}
        }
    }

    componentDidMount = () =>
    {
        const obs1 = NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_TYPING, this.isTypingHandler)
        this.observers.push(obs1)
    }
    componentWillUnmount = () =>
    {
        this.observers.forEach(o => o.remove())
        this.observers = null;
    }
    isTypingHandler = (...args:any[]) =>
    {
        let object = args[0]
        let user = object.user
        const authUserId = this.props.authenticatedUser && this.props.authenticatedUser.id
        if(user == authUserId)
        {
            return
        }
        let it = {...this.state.isTyping}
        let oldUserTimer = it[user]
        if(oldUserTimer)
        {
            clearTimeout(oldUserTimer)
        }
        it[user] = setTimeout(() =>
        {
            let it = this.removeUserFromIsTypingData(user)
            this.setState({isTyping:it})

        }, Settings.clearSomeoneIsTypingInterval)
        this.setState({isTyping:it})
    }
    removeUserFromIsTypingData = (user:number) => {
        let it = {...this.state.isTyping}
        delete it[user]
        return it
    }

    render() {
        const profile = this.props.contact
        const isActive = this.props.contextData.profile && this.props.contextData.profile.id == profile.id
        const cn = classnames("d-flex list-item", {"active": isActive})
        return (
            <Link className={cn} to={Routes.profileUrl(profile.slug_name)} key={profile.id} onClick={this.props.onClick}>
                <div className="icon">
                    <i className="fa fa-user"/>
                </div>
                <div className="name text-truncate flex-grow-1">{profile.first_name + " " + profile.last_name}</div>
                <div className="avatar">
                    <UserProfileAvatar size={22} profileId={profile.id}>
                        {this.state.isTyping[profile.id] && <div className="typing-indicator-container"><TypingIndicator/></div>}
                    </UserProfileAvatar>
                </div>
            </Link>
        )
    }
}

const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps =>
{
    const authenticatedUser = state.authentication.profile

    return {
        authenticatedUser
    }
}

export default withContextData(connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(ContactListItem))