import * as React from "react";
import { connect, DispatchProp } from 'react-redux'
import "./ContactsModule.scss"
import { UserProfile, UserStatus } from '../../types/intrasocial_types';
import { NotificationCenter } from "../../utilities/NotificationCenter";
import { EventStreamMessageType } from "../../network/ChannelEventStream";
import { EventSubscription } from "fbemitter";
import Avatar from "../../components/general/Avatar";
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
import CollapseComponent from '../../components/general/CollapseComponent';

type OwnProps = {
    breakpoint:ResponsiveBreakpoint
} & CommonModuleProps & DispatchProp
type ReduxStateProps = {
    authenticatedUser:UserProfile
    contacts:UserProfile[]
}
type ReduxDispatchProps ={
}
type State = {
    activeVisible: boolean
    activeCount: number
    awayVisible: boolean
    awayCount: number
    dndVisible: boolean
    dndCount: number
    inactiveVisible: boolean
    inactiveCount: number
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
            activeVisible:true,
            activeCount:undefined,
            awayVisible:true,
            awayCount:undefined,
            dndVisible:true,
            dndCount:undefined,
            inactiveVisible:false,
            inactiveCount:undefined
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
    fetchContacts = (offset:number, completion:(items:PaginationResult<UserProfile>) => void ) => {
        let contacts = this.props.contacts
        completion({results:contacts, count:contacts.length})
    }
    renderContact = (contact:UserProfile) => {
        return <div className="avatar-profile main-content-secondary-background" key={"contact_" + contact.id}>
                    <Link className="d-flex flex-column" to={Routes.profileUrl(contact.slug_name)}>
                        <div className="d-flex header">
                            <Avatar size={34} image={contact.avatar} borderColor="white" borderWidth={2} userStatus={contact.id} >
                            {this.state.isTyping[contact.id] && <div className="typing-indicator-container"><TypingIndicator /></div>}
                            </Avatar>
                        </div>
                        <div className="d-flex footer">
                            <div className="text-truncate">{contact.first_name + " " + contact.last_name}</div>
                        </div>
                    </Link>
                </div>
    }
    renderProfileList = (fetchData) => {
        const {className, ...rest} = this.props
        return <ListComponent<UserProfile>
                ref={this.contactList}
                reloadContext={uniqueId()}
                fetchData={fetchData}
                loadMoreOnScroll={false}
                renderItem={this.renderContact}
                className={"grid"} />
    }
    fetchActiveContacts = (offset:number, completion:(items:PaginationResult<UserProfile>) => void ) => {
        const filtered = this.props.contacts.filter((profile) => {
            if (profile && profile.user_status == UserStatus.active)
                return profile
        })
        this.setState({activeCount: filtered.length})
        completion({results:filtered, count:filtered.length})
    }

    toggleActiveVisible = () => {
        this.setState({activeVisible:!this.state.activeVisible})
    }
    renderActive = () => {
        return <div className="group-active">
            <div className={"group-header d-flex"} onClick={this.toggleActiveVisible}>
                <div className="group-title">{translate("user.status.active")}</div>
                <div className="count badge badge-dark badge-pill">
                    {this.state.activeCount}
                </div>
            </div>
            <CollapseComponent removeContentOnCollapsed={false} className="filter-content-wrapper" visible={this.state.activeVisible && this.state.activeCount != 0}>
                {this.renderProfileList(this.fetchActiveContacts)}
            </CollapseComponent>
        </div>
    }

    fetchAwayContacts = (offset:number, completion:(items:PaginationResult<UserProfile>) => void ) => {
        const filtered = this.props.contacts.filter((profile) => {
            if (profile && profile.user_status == UserStatus.away)
                return profile
        })
        this.setState({awayCount: filtered.length})
        completion({results:filtered, count:filtered.length})
    }
    toggleAwayVisible = () => {
        this.setState({awayVisible:!this.state.awayVisible})
    }
    renderAway = () => {
        return <div className="group-away">
            <div className={"group-header d-flex"} onClick={this.toggleAwayVisible}>
                <div className="group-title">{translate("user.status.away")}</div>
                <div className="count badge badge-dark badge-pill">
                    {this.state.awayCount}
                </div>
            </div>
            <CollapseComponent removeContentOnCollapsed={false} className="filter-content-wrapper" visible={this.state.awayVisible && this.state.awayCount != 0}>
                {this.renderProfileList(this.fetchAwayContacts)}
            </CollapseComponent>
        </div>
    }

    fetchDNDContacts = (offset:number, completion:(items:PaginationResult<UserProfile>) => void ) => {
        const filtered = this.props.contacts.filter((profile) => {
            if (profile && profile.user_status == UserStatus.dnd)
                return profile
        })
        this.setState({dndCount: filtered.length})
        completion({results:filtered, count:filtered.length})
    }
    toggleDNDVisible = () => {
        this.setState({dndVisible:!this.state.dndVisible})
    }
    renderDND = () => {
        return <div className="group-dnd">
            <div className="group-header d-flex" onClick={this.toggleDNDVisible}>
                <div className="group-title">{translate("user.status.dnd")}</div>
                <div className="count badge badge-dark badge-pill">
                    {this.state.dndCount}
                </div>
            </div>
            <CollapseComponent removeContentOnCollapsed={false} className="filter-content-wrapper" visible={this.state.dndVisible && this.state.dndCount != 0}>
                {this.renderProfileList(this.fetchDNDContacts)}
            </CollapseComponent>
        </div>
    }

    fetchInactiveContacts = (offset:number, completion:(items:PaginationResult<UserProfile>) => void ) => {
        const filtered = this.props.contacts.filter((profile) => {
            if (profile && (profile.user_status == UserStatus.invisible ||
                            profile.user_status == UserStatus.unavailable ||
                            profile.user_status == UserStatus.vacation))
                return profile
        })
        this.setState({inactiveCount: filtered.length})
        completion({results:filtered, count:filtered.length})
    }
    toggleInactiveVisible = () => {
        this.setState({inactiveVisible:!this.state.inactiveVisible})
    }
    renderCount = () => {

    }
    renderInactive = () => {
        return <div className="group-unavailable">
            <div className={"group-header d-flex"} onClick={this.toggleInactiveVisible}>
                <div className="group-title">{translate("user.status.unavailable")}</div>
                <div className="count badge badge-dark badge-pill">
                    {this.state.inactiveCount}
                </div>
            </div>
            <CollapseComponent removeContentOnCollapsed={false} className="filter-content-wrapper" visible={this.state.inactiveVisible && this.state.inactiveCount != 0}>
                {this.renderProfileList(this.fetchInactiveContacts)}
            </CollapseComponent>
        </div>
    }

    render = () =>
    {
        const {className, breakpoint, isModal, ...rest} = this.props
        const cn = classnames("contacts-module", className)
        return <SimpleModule {...rest}
                showHeader={!isModal}
                className={cn}
                breakpoint={breakpoint}
                isLoading={false}
                headerTitle={translate("contacts.module.title")}>
                <div className="vertical-scroll">
                    {this.renderActive()}
                    {this.renderAway()}
                    {this.renderDND()}
                    {this.renderInactive()}
                </div>
            </SimpleModule>
    }
}
const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps =>
{
    const authenticatedUser = state.authentication.profile
    const contacts = (authenticatedUser && authenticatedUser.id && state.profileStore.allIds.map(id => state.profileStore.byId[id]).filter(u => u.id != authenticatedUser.id)) || []
    return {
        contacts,
        authenticatedUser,
    }
}

export default connect(mapStateToProps, null)(ContactsModule)