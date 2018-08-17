import * as React from "react";
import { connect } from 'react-redux'
import { UserProfile, avatarStateColorForUserProfile } from '../../reducers/profileStore';
import { CollapsiblePanel, ArrowDirectionCollapsed } from '../general/CollapsiblePanel';
import { Routes } from "../../utilities/Routes";
import { Avatar } from "../general/Avatar";
import { Link } from "react-router-dom";
import { List } from "../general/List";
require("./RightNavigation.scss");
export interface Props {
    profiles:UserProfile[],
    contacts:number[]
}
export interface State {
    contacts:UserProfile[],
}
class RightNavigation extends React.Component<Props, {}> {
    state:State
    constructor(props) {
        super(props);
        this.state = {contacts:[]}
    }
    componentWillMount()
    {
        this.checkUpdate()
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
                            <Avatar image={contact.avatar} borderColor="green" borderWidth={2} stateColor={avatarStateColorForUserProfile(contact)} />
                            </Link>
                        </li>)
                    } )}</List>
                </CollapsiblePanel>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        profiles:state.profileStore.profiles,
        contacts:state.contactListCache.contacts
    };
}
export default connect(mapStateToProps, null)(RightNavigation);