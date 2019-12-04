import * as React from "react";
import { UserProfile, UserStatus } from '../../../../types/intrasocial_types';
import "../SideBarItem.scss";
import LoadingSpinner from "../../../LoadingSpinner";
import { translate } from '../../../../localization/AutoIntlProvider';
import { ReduxState } from "../../../../redux";
import { connect } from "react-redux";
import { EditorState } from "draft-js";
import { SearcQueryManager } from "../../../general/input/contextsearch/extensions";
import SearchBar from './SearchBar';
import ContactListItem from "./ContactListItem";
import EmptyListItem from './EmptyListItem';

type State = {
    isLoading: boolean
    query: string
    title: string
    subtitle: string
}

type OwnProps = {
    reverse?: boolean
    onClose?: (e: React.MouseEvent) => void
}

type ReduxStateProps = {
        authenticatedUser: UserProfile
        contacts: UserProfile[]
}

type Props = OwnProps & ReduxStateProps

class SideBarContactsContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            isLoading: false,
            query: "",
            title: translate('sidebar.contacts.title'),
            subtitle: undefined,
        }
    }

    componentDidMount = () => {
        const contactList = document.getElementById("contacts")
        if (contactList && this.props.reverse) {
            contactList.scrollTo({top: contactList.scrollHeight})
        }
    }

    componentDidUpdate = (prevProps: Props, prevState: State) => {
        const contactList = document.getElementById("contacts")
        if (contactList && this.props.reverse) {
            contactList.scrollTo({top: contactList.scrollHeight})
        }
    }

    shouldComponentUpdate = (nextProps: Props, nextState: State) => {
        const search = this.state.query != nextState.query
        const contactsUpdate = this.props.contacts != nextProps.contacts
        return search || contactsUpdate
    }

    searchChanged = (es:EditorState) => {
        const searchData = SearcQueryManager.getContextSearchData(es, [])
        this.setState({query: searchData.query});
    }

    render = () => {
        var contacts = this.props.contacts
        contacts.sort(UserStatus.contactsSort)
        if (this.props.reverse)
            contacts = contacts.reverse();
        if (this.state.query && this.state.query.length > 0) {
            contacts = contacts.filter(user => user.slug_name.includes(this.state.query.trim().toLowerCase()))
        }
        return (<>
            <div className="sidebar-content-header">
                <div className="sidebar-title">
                    {this.state.title}
                    { this.state.subtitle &&
                        <div className="sidebar-subtitle text-truncate">
                            {this.state.subtitle}
                        </div>
                    }
                </div>
            </div>
            <div className="sidebar-content-list">
                <div className="content d-flex">
                    <div className="search">
                        <SearchBar onSearchQueryChange={this.searchChanged}/>
                    </div>
                    <div id="contacts" className="items scrollbar flex-shrink-1">
                        {this.state.isLoading &&
                            <LoadingSpinner />
                            ||
                            contacts.map((user) => {if (user) {return <ContactListItem key={"contact-" + user.id} contact={user}/>}})
                        }
                        { !this.state.isLoading && contacts.length == 0 &&
                            <EmptyListItem/>
                        }
                    </div>
                </div>
            </div>
        </>)
    }
}

const mapStateToProps = (state:ReduxState, ownProps: OwnProps):ReduxStateProps =>
{
    const authenticatedUser = state.authentication.profile
    const contacts = (authenticatedUser &&
                      authenticatedUser.id &&
                      state.profileStore.allIds.map(id => state.profileStore.byId[id])
                                               .filter(u => u.id != authenticatedUser.id)) || []

    return {
        authenticatedUser,
        contacts,
    }
}

export default connect(mapStateToProps, null)(SideBarContactsContent)