import * as React from 'react';
import { translate } from '../../../localization/AutoIntlProvider';
import { Community, CommunityInvitation } from '../../../types/intrasocial_types';
import { ProfileManager } from '../../../managers/ProfileManager';
import { ApiClient, PaginationResult } from '../../../network/ApiClient';
import ListComponent from '../ListComponent';
import Button from 'reactstrap/lib/Button';
import { GenericListItem } from '../GenericListItem';
import Avatar from '../Avatar';
import { TimeComponent } from '../TimeComponent';
import { Checkbox } from '../input/Checkbox';
import "./CommunityInvitationsComponent.scss"
import classnames from 'classnames';
import SimpleDialog from '../dialogs/SimpleDialog';
import { userFullName, userAvatar, listPageSize, uniqueId } from '../../../utilities/Utilities';
import CommunityInviteComponent from './CommunityInviteComponent';
import { Input } from 'reactstrap';
import { FormComponentErrorMessage } from '../../form/FormController';
type OwnProps = {
    community:Community
}
type InvitationFilters = {
    search:string
    email:boolean 
    user:boolean
    searchEmail:boolean
    searchUser:boolean
    searchFromUser:boolean
}
type State = {
    selectedInvitations:number[]
    filters:InvitationFilters
    failed:number[]
    inviteFormVisible:boolean
    inviteFormReloadKey:string
}
type Props = OwnProps
export default class CommunityInvitationsComponent extends React.Component<Props, State> {
    listRef = React.createRef<ListComponent<CommunityInvitation>>()
    reloadIdleTimeout: NodeJS.Timer = null
    constructor(props:Props) {
        super(props);
        this.state = {
            selectedInvitations:[],
            inviteFormVisible:false,
            inviteFormReloadKey:uniqueId(),
            filters:{
                search:"",
                email:null,
                user:null,
                searchEmail:true,
                searchUser:true,
                searchFromUser:false,
            },
            failed:[]
        }
    }
    renderInvitation = (invitation:CommunityInvitation) =>  {
        const failedArray = this.state.failed
        const user = invitation.user && ProfileManager.getProfileById(invitation.user)
        const title = <div className="text-truncate">{user && userFullName(user) || invitation.email}</div>
        const avatarUrl = userAvatar(user)
        const failed = failedArray.contains( invitation.id )
        const cn = classnames({"bg-warning":failed})
        return <GenericListItem className={cn} header={title} left={<Avatar size={44} image={avatarUrl} />} footer={<TimeComponent date={invitation.created_at} />}/>
    }
    fetchInvitations = (offset:number, completion:(items:PaginationResult<CommunityInvitation>) => (void)) => {
        let {search, email, user, searchEmail, searchUser, searchFromUser} = this.state.filters
        if(search.length == 0)
        {
            search = null
        }
        ApiClient.getCommunityInvitations(listPageSize(44), offset, this.props.community.id, search, email, user,searchEmail, searchUser, searchFromUser, (data) => {
            completion(data)
        })
    }
    handleSelectionChange = (id: number, selected:boolean) => {
        const selectedItems = [...this.state.selectedInvitations]
        selectedItems.toggleElement(id)
        this.setState((prevState:State) => {
            const failed = [...prevState.failed]
            if(!selected)
                failed.remove(id)
            return {selectedInvitations:selectedItems, failed}
        })
    }
    selectAll = () => {
        const list = this.getList()
        const items = list && list.getItems().map(i => i.id) || []
        this.setState(() => {
            return {selectedInvitations:items}
        })
    }
    clearSelection = () => {
        this.setState(() => {
            return {selectedInvitations:[]}
        })
    }
    headerToggle = () => {
        const selected = this.state.selectedInvitations
        if(selected.length > 0)
        {
            this.clearSelection()
        }
        else 
            this.selectAll()
    }
    showInviteForm = () => {
        this.setState((prevState:State) => {
            return {inviteFormVisible:true, inviteFormReloadKey:uniqueId()}
        })
    }
    hideInviteForm = () => {

        this.setState((prevState:State) => {
            return {inviteFormVisible:false}
        })
    }
    getList = () => {
        return this.listRef && this.listRef.current
    }
    reloadList = () => {
        this.hideInviteForm()
        const list = this.getList()
        list && list.reload()
    }
    handleInviteCompleted  = () => {
        this.reloadList()
    }
    deleteInvitations = () => {
        let ids = [...this.state.selectedInvitations]
        ApiClient.deleteCommunityInvitations(ids, (response, status, error) => {
            const errors = response && response.failed || []
            const selected = errors.map(f => f.delete)
            const failed = [...selected]
            if(error && failed.length == 0)
                failed.push(-1)// show default error
            this.setState(() => {
                return {failed:failed, selectedInvitations:selected}
            }, this.reloadList)
            console.log("deleted response", response)
        })
    }

    handleSearchInputChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        this.setState((prevState:State) => {
            const filters = {...prevState.filters}
            filters.search = value
            return {filters}
        }, this.reloadListOnIdle)
    }
    reloadListOnIdle = () => {
        if(this.reloadIdleTimeout)
            clearTimeout(this.reloadIdleTimeout)
        this.reloadIdleTimeout = setTimeout(this.reloadList, 300)
    }
    renderList = () => {
        const {selectedInvitations} = this.state
        const headerActive = selectedInvitations.length > 0
        const error = this.state.failed.length > 0 ? translate("form.invite.delete.error") : undefined
        return <>
                {error && <FormComponentErrorMessage className="d-block" errors={{error}} />}
                <Input value={this.state.filters.search} type="text" onChange={this.handleSearchInputChange} placeholder={translate("common.filter.invitations")}/>
                <div className={classnames("list-header", {active:headerActive})}>
                    <Checkbox checked={headerActive} checkedIcon="fas fa-minus" onValueChange={this.headerToggle} />
                    <div className="flex-grow-1 text-truncate p-1">{translate("common.invitation")}</div>
                    {headerActive && 

                        <Button onClick={this.deleteInvitations} className="ml-1 flex-shrink-0" size="xs" color="danger">
                            <i className="fas fa-trash mr-1"></i>{translate("common.delete")}
                        </Button>
                        ||
                        <Button onClick={this.showInviteForm} className="ml-1 flex-shrink-0" size="xs" color="primary">
                            <i className="fas fa-plus mr-1"></i>{translate("common.invite")}
                        </Button>
                    }
                </div>
                <ListComponent<CommunityInvitation> 
                    ref={this.listRef}
                    fetchData={this.fetchInvitations}
                    renderItem={this.renderInvitation}
                    loadMoreOnScroll={true}
                    onItemSelectionChange={this.handleSelectionChange}
                    selected={this.state.selectedInvitations}
                    isSelecting={true}
                    findScrollParent={true}
                    clearDataBeforeFetch={false}
                />
                </>
    }
    renderInviteForm = () => {
        const visible = this.state.inviteFormVisible
        const community = this.props.community
        const list = this.getList()
        const activeMemberInvitations = list && list.getItems().map(i => i.user).filter(u => !!u) || []
        return <CommunityInviteComponent key={this.state.inviteFormReloadKey} onInvited={this.handleInviteCompleted} didCancel={this.hideInviteForm} visible={visible} community={community} activeMembershipInvitations={activeMemberInvitations} />
    }
    render = () => {
        return <div className="community-invitations">
                    {this.renderList()}
                    {this.renderInviteForm()}
                </div>
        
    }
}