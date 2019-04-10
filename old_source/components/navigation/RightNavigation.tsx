import * as React from "react";
import { connect } from 'react-redux'
import { CollapsiblePanel, ArrowDirectionCollapsed } from '../general/CollapsiblePanel';
import Routes from "../../utilities/Routes";
import { Avatar } from "../general/Avatar";
import { Link } from "react-router-dom";
import { List } from "../general/List";
import { RootState } from "../../reducers";
import { TypingIndicator } from '../general/TypingIndicator';
import { Settings } from '../../utilities/Settings';
import { cloneDictKeys } from '../../utilities/Utilities';
import { NotificationCenter } from "../../notifications/NotificationCenter";
import { UserProfile, avatarStateColorForUserProfile } from "../../types/intrasocial_types2";
import { ProfileManager } from '../../managers/ProfileManager';
import NotificationsList from "../general/NotificationsList";
import { EventStreamMessageType } from "../../app/network/ChannelEventStream";
require("./RightNavigation.scss")
interface State {
    contacts:UserProfile[],
    isTyping:any
    collapsibleOpen:boolean
}

export interface OwnProps
{
}
interface ReduxStateProps
{
    profiles:{[id:number]:UserProfile}
    contacts:number[]
    authenticatedProfile:UserProfile
}
type Props = ReduxStateProps & OwnProps
class RightNavigation extends React.Component<Props, {}> {
    state:State
    constructor(props) {
        super(props);
        this.state = {contacts:[], isTyping:{}, collapsibleOpen:false}
        this.isTypingHandler = this.isTypingHandler.bind(this)
    }
    componentWillMount()
    {
        this.checkUpdate()
    }
    componentDidMount()
    {
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.CONVERSATION_TYPING, this.isTypingHandler)
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.USER_UPDATE, this.isUserUpdateHandler)
    }
    componentWillUnmount()
    {
        NotificationCenter.removeObserver("eventstream_" + EventStreamMessageType.CONVERSATION_TYPING, this.isTypingHandler)
        NotificationCenter.removeObserver("eventstream_" + EventStreamMessageType.USER_UPDATE, this.isUserUpdateHandler)
    }
    isTypingHandler(...args:any[])
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
    isUserUpdateHandler(...args:any[]) {
        let object = args[0];
        ProfileManager.storeProfile(object);
    }
    componentDidUpdate()
    {
        this.checkUpdate()
    }
    checkUpdate()
    {
        let newContacts:UserProfile[] = []
        this.props.contacts.forEach((id) =>
        {
            let f = this.props.profiles[id]
            if(f)
            newContacts.push(f)
        })
        var needsUpdate = false
        let currentContacts = this.state.contacts
        if (currentContacts.length != newContacts.length)
        {
            needsUpdate = true
        }
        if(!needsUpdate)
            needsUpdate = newContacts.some((c, i) => { return c != currentContacts[i]})
        if(needsUpdate)
            this.setState({contacts: newContacts})
    }
    onCollapsibleStateChanged = (open:boolean) => {
        this.setState({collapsibleOpen:open})
    }
    render() {
        const contacts = this.state.contacts
        return(
            <div id="right-navigation" className="d-flex transition">
                <CollapsiblePanel onCollapsibleStateChanged={this.onCollapsibleStateChanged} id="right-navigation" arrowDirectionCollapsed={ArrowDirectionCollapsed.LEFT}>
                    <div id="contact-list">
                        <List>{contacts.map((contact, index) => {
                            return (
                            <div className="avatar-profile" key={index}>
                                <Link to={Routes.profileUrl(contact.slug_name)}>
                                    <Avatar image={contact.avatar} borderColor="green" borderWidth={2} stateColor={avatarStateColorForUserProfile(contact)}>
                                    {this.state.isTyping[contact.id] && <div className="typing-indicator-container"><TypingIndicator /></div>}
                                    </Avatar>
                                </Link>
                            </div>)
                    } )}</List>
                    </div>
                    {this.state.collapsibleOpen && <NotificationsList />}
                </CollapsiblePanel>
            </div>
        );
    }
}

const mapStateToProps = (state:RootState, ownProps: OwnProps):ReduxStateProps => {
    return {
        profiles:state.profileStore.byId,
        contacts:state.contactListCache.contacts,
        authenticatedProfile:state.auth.profile,
    }
}
export default connect<ReduxStateProps, void, OwnProps>(mapStateToProps, null)(RightNavigation);