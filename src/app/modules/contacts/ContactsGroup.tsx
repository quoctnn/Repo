import * as React from "react";
import { connect } from 'react-redux'
import "./ContactsModule.scss"
import { UserProfile, UserStatus } from '../../types/intrasocial_types';
import { NotificationCenter } from "../../utilities/NotificationCenter";
import { EventStreamMessageType } from "../../network/ChannelEventStream";
import { EventSubscription } from "fbemitter";
import { Link } from "react-router-dom";
import Routes from "../../utilities/Routes";
import { ReduxState } from "../../redux";
import { Settings } from "../../utilities/Settings";
import { TypingIndicator } from '../../components/general/TypingIndicator';
import ListComponent from '../../components/general/ListComponent';
import { PaginationResult } from "../../network/ApiClient";
import { uniqueId } from '../../utilities/Utilities';
import CollapseComponent from '../../components/general/CollapseComponent';
import UserProfileAvatar from "../../components/general/UserProfileAvatar";

type OwnProps = {
    filters:UserStatus[]
    title:string
    openOnLoad:boolean
}
type ReduxStateProps = {
    contacts:UserProfile[]
    authenticatedUser:UserProfile
}
type ReduxDispatchProps ={
}
type State = {
    visible: boolean
    isTyping:any
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class ContactsGroup extends React.PureComponent<Props, State> {
    private contactList = React.createRef<ListComponent<UserProfile>>()
    private observers:EventSubscription[] = []
    constructor(props:Props) {
        super(props)
        this.state = {
            isTyping:{},
            visible:props.openOnLoad        }
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
    renderContact = (contact:UserProfile) => {
        return <div className="avatar-profile main-content-secondary-background" key={"contact_" + contact.id}>
                    <Link className="d-flex flex-column" to={Routes.profileUrl(contact.slug_name)}>
                        <div className="d-flex header">
                            <UserProfileAvatar size={34} profileId={contact.id} borderColor="white" borderWidth={2} >
                                {this.state.isTyping[contact.id] && <div className="typing-indicator-container"><TypingIndicator /></div>}
                            </UserProfileAvatar>
                        </div>
                        <div className="d-flex footer">
                            <div className="text-truncate">{contact.first_name + " " + contact.last_name}</div>
                        </div>
                    </Link>
                </div>
    }
    renderProfileList = (fetchData) => {
        return
    }
    toggleVisible = () => {
        this.setState({visible:!this.state.visible})
    }
    fetchData = (offset: number, completion: (items: PaginationResult<UserProfile>) => void) => {
        return completion({results:this.props.contacts, count:this.props.contacts.length})
    }
    render = () =>
    {
        const {contacts, title, ...rest} = this.props
        return (<>
            <div className={"group-header d-flex"} onClick={this.toggleVisible}>
                <div className="group-title">{title}</div>
                <div className="count badge badge-dark badge-pill">
                    {contacts.length}
                </div>
            </div>
            <CollapseComponent removeContentOnCollapsed={false} className="filter-content-wrapper" visible={this.state.visible && contacts.length != 0}>
                <ListComponent<UserProfile> ref={this.contactList} reloadContext={uniqueId()} fetchData={this.fetchData}
                loadMoreOnScroll={false} renderItem={this.renderContact} className={"grid"} />
            </CollapseComponent>
        </>)
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps =>
{
    const authenticatedUser = state.authentication.profile
    var contacts = (authenticatedUser &&
                      authenticatedUser.id &&
                      state.profileStore.allIds.map(id => state.profileStore.byId[id])
                                               .filter(u => u.id != authenticatedUser.id)) || []
    contacts = contacts.filter((profile) => {if (ownProps.filters.contains(profile.user_status)) return profile})

    return {
        authenticatedUser,
        contacts,
    }
}

export default connect(mapStateToProps, null)(ContactsGroup)