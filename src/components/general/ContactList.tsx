import * as React from "react";
import { connect } from 'react-redux'
import { RootState } from '../../reducers/index';
import { UserProfile, avatarStateColorForUserProfile } from '../../types/intrasocial_types';
import { List } from "./List";
import { Link } from "react-router-dom";
import { Avatar } from "./Avatar";
import Routes from "../../utilities/Routes";
import { TypingIndicator } from "./TypingIndicator";
import { NotificationCenter } from "../../notifications/NotificationCenter";
import { EventStreamMessageType } from "./ChannelEventStream";
import { cloneDictKeys } from "../../utilities/Utilities";
import { Settings } from "../../utilities/Settings";
require("./ContactList.scss");

export interface OwnProps
{
}
interface ReduxStateProps
{
    authenticatedProfile:UserProfile
    contacts:UserProfile[]
}
interface ReduxDispatchProps
{
}
interface State
{
    isTyping:any
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class ContactList extends React.PureComponent<Props, State> {

    constructor(props) {
        super(props)
        this.state = {
            isTyping:{},
        }
    }
    componentDidMount = () => 
    {
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_TYPING, this.isTypingHandler)
    }
    componentWillUnmount = () => 
    {
        NotificationCenter.removeObserver("eventstream_" + EventStreamMessageType.CONVERSATION_TYPING, this.isTypingHandler)
    }
    isTypingHandler = (...args:any[]) => 
    {
        let object = args[0]
        let user = object.user
        if(user == this.props.authenticatedProfile.id)
        {
            return
        }
        let st = this.state.isTyping
        let it = cloneDictKeys(st)
        let oldUserTimer = it[user]
        if(oldUserTimer)
        {
            clearTimeout(oldUserTimer)
        }
        it[user] = setTimeout(() =>
        {
            let st = this.state.isTyping
            let it = cloneDictKeys(st)
            delete it[user]
            this.setState({isTyping:it})

        }, Settings.clearSomeoneIsTypingInterval)
        this.setState({isTyping:it})
    }
    render = () => 
    {
        const contacts = this.props.contacts
        return(
            <div id="contact-list">
                <List>{contacts.map((contact, index) => {
                    return (
                    <div className="avatar-profile" key={index}>
                        <Link className="d-flex" to={Routes.profileUrl(contact.slug_name)}>
                            <Avatar image={contact.avatar} borderColor="green" borderWidth={2} stateColor={avatarStateColorForUserProfile(contact)}>
                            {this.state.isTyping[contact.id] && <div className="typing-indicator-container"><TypingIndicator /></div>}
                            </Avatar>
                            <div className="d-flex text-truncate right-text-rows">
                                <div className="text-truncate">{contact.first_name + " " + contact.last_name}</div>
                                {contact.biography && <div className="text-truncate">{contact.biography}</div>}
                            </div>
                        </Link>
                    </div>)
            } )}</List>
            </div>
        );
    }
}
const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => 
{
    const profiles = state.profileStore.byId
    const contacts = state.contactListCache.contacts.map(id => profiles[id])
    return {
        contacts,
        authenticatedProfile:state.auth.profile,
    }
}

export default connect<ReduxStateProps, {}, OwnProps>(mapStateToProps, null)(ContactList);