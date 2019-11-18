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

type State = {
    isLoading: boolean
    query: string
    title: string
    subtitle: string
}

type OwnProps = {
    onClose: (e: React.MouseEvent) => void
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


    shouldComponentUpdate = (nextProps: Props, nextState: State) => {
        const search = this.state.query != nextState.query
        return search
    }

    searchChanged = (es:EditorState) => {
        const searchData = SearcQueryManager.getContextSearchData(es, [])
        this.setState({query: searchData.query});
    }

    contactsSort = ( a:UserProfile, b:UserProfile ) => {
        if ( a.user_status == UserStatus.active && b.user_status != UserStatus.active ||
             a.user_status == UserStatus.away && (b.user_status != UserStatus.away && b.user_status != UserStatus.active) ||
             a.user_status == UserStatus.dnd && (b.user_status != UserStatus.dnd && b.user_status != UserStatus.away && b.user_status != UserStatus.active) ||
             a.user_status == UserStatus.vacation && (b.user_status != UserStatus.vacation && b.user_status != UserStatus.dnd && b.user_status != UserStatus.away && b.user_status != UserStatus.active)
             ){
            return -1;
        }
        if (
             b.user_status == UserStatus.active && a.user_status != UserStatus.active ||
             b.user_status == UserStatus.away && (a.user_status != UserStatus.away && a.user_status != UserStatus.active) ||
             b.user_status == UserStatus.dnd && (a.user_status != UserStatus.dnd && a.user_status != UserStatus.away && a.user_status != UserStatus.active) ||
             b.user_status == UserStatus.vacation && (a.user_status != UserStatus.vacation && a.user_status != UserStatus.dnd && a.user_status != UserStatus.away && a.user_status != UserStatus.active) ||
             b.user_status == UserStatus.invisible ||
             b.user_status == UserStatus.unavailable
        ){
            return 1;
        }
        return 0;
    }

    render = () => {
        var contacts = this.props.contacts
        contacts.sort((a, b) => {return this.contactsSort(a, b)})

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
                <div className="content d-flex flex-column">
                    <div className="search">
                        <SearchBar onSearchQueryChange={this.searchChanged}/>
                    </div>
                    <div className="items scrollbar flex-shrink-1">
                        {this.state.isLoading &&
                            <LoadingSpinner />
                            ||
                            contacts.map((user) => {if (user) {return <ContactListItem key={"contact-" + user.id} contact={user}/>}})
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