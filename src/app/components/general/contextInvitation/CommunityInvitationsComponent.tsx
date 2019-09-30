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
    didCancel:() => void
    visible:boolean
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
    inviteFormVisible:boolean
    filters:InvitationFilters
    failed:number[]
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
        const title = user && userFullName(user) || invitation.email
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
    handleListSelect = (items: number[]) => {
        this.setState((prevState:State) => {
            const failed = [...prevState.failed].filter(fid => items.contains(fid))
            return {selectedInvitations:items, failed}
        })
    }
    clearSelection = () => {
        const list = this.getList()
        list && list.clearSelection()
    }
    selectAll = () => {
        const list = this.getList()
        list && list.selectAll()
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
        const testId = 5
        let ids = [...this.state.selectedInvitations]
        const hasTest = ids.contains(testId)
        if(hasTest)
            ids = ids.except(5)
        ApiClient.deleteCommunityInvitations(ids, (response, status, error) => {
            if (hasTest)
                response && response.failed && response.failed.push({delete:5})
            const errors = response && response.failed || []
            this.setState(() => {
                return {failed:errors.map(f => f.delete)}
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
                    selectedItems={this.handleListSelect}
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
        const {visible, didCancel} = this.props
        return <SimpleDialog className="community-invitations" didCancel={didCancel} visible={visible} header={translate("community.invitations")}>
                    {this.renderList()}
                    {this.renderInviteForm()}
                </SimpleDialog>
        
    }
}