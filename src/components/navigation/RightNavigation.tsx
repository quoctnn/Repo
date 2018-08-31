import * as React from "react";
import { connect } from 'react-redux'
import { UserProfile, avatarStateColorForUserProfile } from '../../reducers/profileStore';
import { CollapsiblePanel, ArrowDirectionCollapsed } from '../general/CollapsiblePanel';
import { Routes } from "../../utilities/Routes";
import { Avatar } from "../general/Avatar";
import { Link } from "react-router-dom";
import { List } from "../general/List";
import { RootReducer } from "../../reducers";
import { addSocketEventListener, SocketMessageType, removeSocketEventListener } from '../general/ChannelEventStream';
import { TypingIndicator } from '../general/TypingIndicator';
import { Settings } from '../../utilities/Settings';
import { cloneDictKeys } from '../../utilities/Utilities';
require("./RightNavigation.scss");
export interface Props {
    profiles:UserProfile[],
    contacts:number[],
    profile:UserProfile
}
export interface State {
    contacts:UserProfile[],
    isTyping:any
}
class RightNavigation extends React.Component<Props, {}> {
    state:State
    constructor(props) {
        super(props);
        this.state = {contacts:[], isTyping:{}}
        this.isTypingHandler = this.isTypingHandler.bind(this)
    }
    componentWillMount()
    {
        this.checkUpdate()
    }
    componentDidMount()
    {
        addSocketEventListener(SocketMessageType.CONVERSATION_TYPING, this.isTypingHandler)
    }
    componentWillUnmount()
    {
        removeSocketEventListener(SocketMessageType.CONVERSATION_TYPING, this.isTypingHandler)
    }
    isTypingHandler(event:CustomEvent)
    {
        let user = event.detail.user  
        if(user == this.props.profile.id)
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
    componentDidUpdate()
    {
        this.checkUpdate()
    }
    checkUpdate()
    {
        let newContacts:UserProfile[] = []
        this.props.contacts.forEach((id) => 
        {
            let f = this.props.profiles.find( i => i.id == id)
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
    render() {
        
        return(
            <div id="right-navigation" className="flex transition">
                <CollapsiblePanel id="right-navigation" arrowDirectionCollapsed={ArrowDirectionCollapsed.LEFT}>
                    <List>{this.state.contacts.map((contact, index) => {
                        return (
                        <li className="avatar-profile" key={index}>
                            <Link to={Routes.PROFILES + contact.slug_name}>
                                <Avatar image={contact.avatar} borderColor="green" borderWidth={2} stateColor={avatarStateColorForUserProfile(contact)}>
                                {this.state.isTyping[contact.id] && <div className="typing-indicator-container"><TypingIndicator /></div>}
                                </Avatar>
                            </Link>
                        </li>)
                    } )}</List>
                </CollapsiblePanel>
            </div>
        );
    }
}
const mapStateToProps = (state:RootReducer) => {
    return {
        profiles:state.profileStore.profiles,
        contacts:state.contactListCache.contacts,
        profile:state.profile,
    };
}
export default connect(mapStateToProps, null)(RightNavigation);