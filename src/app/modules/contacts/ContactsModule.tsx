import * as React from "react";
import { connect } from 'react-redux'
import "./ContactsModule.scss"
import { UserProfile, UserStatus } from '../../types/intrasocial_types';
import { NotificationCenter } from "../../utilities/NotificationCenter";
import { EventStreamMessageType } from "../../network/ChannelEventStream";
import { EventSubscription } from "fbemitter";
import { Avatar } from "../../components/general/Avatar";
import { Link } from "react-router-dom";
import Routes from "../../utilities/Routes";
import { ReduxState } from "../../redux";
import { Settings } from "../../utilities/Settings";
import { TypingIndicator } from '../../components/general/TypingIndicator';
import ListComponent from '../../components/general/ListComponent';
import { PaginationResult } from "../../network/ApiClient";
import { translate } from "../../localization/AutoIntlProvider";
import SimpleModule from "../SimpleModule";
import classnames from 'classnames';
import { ResponsiveBreakpoint } from "../../components/general/observers/ResponsiveComponent";
import { CommonModuleProps } from "../Module";
import { uniqueId } from '../../utilities/Utilities';

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps
type ReduxStateProps = {
    authenticatedUser:UserProfile
    contacts:UserProfile[]
}
type ReduxDispatchProps ={
}
type State = {
    isTyping:any
}
type Props = ReduxStateProps & ReduxDispatchProps & OwnProps
class ContactsModule extends React.PureComponent<Props, State> {

    private contactList = React.createRef<ListComponent<UserProfile>>()
    private observers:EventSubscription[] = []
    constructor(props:Props) {
        super(props)
        this.state = {
            isTyping:{},
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
        if(user == this.props.authenticatedUser.id)
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
    fetchContacts = (offset:number, completion:(items:PaginationResult<UserProfile>) => void ) => {
        const spacer:UserProfile = {spacer:true} as any
        const contacts = this.props.contacts.concat([spacer])
        completion({results:contacts, count:contacts.length})
    }
    renderContact = (contact:UserProfile) => {
        if((contact as any).spacer)
            return <div className="spacer flex-grow-1 flex-shrink-1" style={{height:1}}></div>
        const userStatus = UserStatus.getObject(contact.user_status)
        return <div className="avatar-profile main-content-secondary-background" key={"contact_" + contact.id}>
                    <Link className="d-flex flex-column" to={Routes.profileUrl(contact.slug_name)}>
                        <div className="d-flex header">
                            <Avatar size={34} image={contact.avatar} borderColor="white" borderWidth={2} statusColor={userStatus && userStatus.color}>
                            {this.state.isTyping[contact.id] && <div className="typing-indicator-container"><TypingIndicator /></div>}
                            </Avatar>
                        </div>
                        <div className="d-flex footer">
                            <div className="text-truncate">{contact.first_name + " " + contact.last_name}</div>
                            {contact.biography && <div className="text-truncate">{contact.biography}</div>}
                        </div>
                    </Link>
                </div>
    }
    render = () => 
    {
        const {className, breakpoint, contextNaturalKey,authenticatedUser, pageSize, showLoadMore, showInModal, isModal, contacts, ...rest} = this.props
        const cn = classnames("contacts-module", className)
        return <SimpleModule {...rest} 
                showHeader={!isModal}
                className={cn} 
                breakpoint={breakpoint} 
                isLoading={false} 
                headerTitle={translate("contacts.module.title")}>
                <ListComponent<UserProfile> 
                            ref={this.contactList} 
                            reloadContext={uniqueId()}
                            fetchData={this.fetchContacts} 
                            loadMoreOnScroll={true}
                            renderItem={this.renderContact} 
                            className="grid" />
            </SimpleModule>
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps => 
{
    const contacts = state.profileStore.allIds.map(id => state.profileStore.byId[id])
    return {
        contacts,
        authenticatedUser:state.authentication.profile,
    }
}

export default connect(mapStateToProps, null)(ContactsModule)