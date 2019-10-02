import * as React from 'react';
import { translate } from '../../../localization/AutoIntlProvider';
import { ContextInvitation, IdentifiableObject, ContextNaturalKey } from '../../../types/intrasocial_types';
import { ProfileManager } from '../../../managers/ProfileManager';
import { ApiClient, PaginationResult } from '../../../network/ApiClient';
import ListComponent from '../ListComponent';
import Button from 'reactstrap/lib/Button';
import { GenericListItem } from '../GenericListItem';
import Avatar from '../Avatar';
import { TimeComponent } from '../TimeComponent';
import { Checkbox } from '../input/Checkbox';
import "./ContextInvitationComponent.scss"
import classnames from 'classnames';
import SimpleDialog from '../dialogs/SimpleDialog';
import { userFullName, userAvatar, listPageSize, uniqueId } from '../../../utilities/Utilities';
import { Input } from 'reactstrap';
import { FormComponentErrorMessage } from '../../form/FormController';
import ContextInviteComponent from './ContextInviteComponent';
type OwnProps = {
    didCancel:() => void
    visible:boolean
    contextNaturalKey:ContextNaturalKey
    contextObject:IdentifiableObject
    members:number[]
    availableMembers:number[]
}
type InvitationFilters = {
    search:string
}
type State = {
    selectedInvitations:number[]
    inviteFormVisible:boolean
    filters:InvitationFilters
    failed:number[]
    inviteFormReloadKey:string
}
type Props = OwnProps
export default class ContextInvitationComponent extends React.Component<Props, State> {
    listRef = React.createRef<ListComponent<ContextInvitation>>()
    reloadIdleTimeout: NodeJS.Timer = null
    constructor(props:Props) {
        super(props);
        this.state = {
            selectedInvitations:[],
            inviteFormVisible:false,
            inviteFormReloadKey:uniqueId(),
            filters:{
                search:"",
            },
            failed:[]
        }
    }
    renderInvitation = (invitation:ContextInvitation) =>  {
        const failedArray = this.state.failed
        const user = invitation.user && ProfileManager.getProfileById(invitation.target_user)
        const title = user && userFullName(user) || `Unknown(${invitation.target_user})`
        const avatarUrl = userAvatar(user)
        const failed = failedArray.contains( invitation.id )
        const cn = classnames({"bg-warning":failed})
        return <GenericListItem className={cn} header={title} left={<Avatar size={44} image={avatarUrl} />} footer={<TimeComponent date={invitation.created_at} />}/>
    }
    fetchInvitations = (offset:number, completion:(items:PaginationResult<ContextInvitation>) => (void)) => {
        let {search} = this.state.filters
        if(search.length == 0)
        {
            search = null
        }
        ApiClient.getContextInvitations(this.props.contextNaturalKey, this.props.contextObject.id, listPageSize(44), offset, search,  (data) => {
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
        let ids = [...this.state.selectedInvitations]
        ApiClient.deleteContextInvitations(this.props.contextNaturalKey, ids, (response, status, error) => {
            const errors = response && response.failed || []
            if(error)
                errors.push({delete:-1})
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
                <ListComponent<ContextInvitation> 
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
        const contextObject = this.props.contextObject
        const list = this.getList()
        const activeMemberInvitations = list && list.getItems().map(i => i.target_user).filter(u => !!u) || []
        return <ContextInviteComponent members={this.props.members} availableMembers={this.props.availableMembers} contextNaturalKey={this.props.contextNaturalKey} key={this.state.inviteFormReloadKey} onInvited={this.handleInviteCompleted} didCancel={this.hideInviteForm} visible={visible} contextObject={contextObject} activeMembershipInvitations={activeMemberInvitations} />
    }
    render = () => {
        const {visible, didCancel} = this.props
        return <SimpleDialog className="context-invitations" didCancel={didCancel} visible={visible} header={translate(`${this.props.contextNaturalKey}.invitations`)}>
                    {this.renderList()}
                    {this.renderInviteForm()}
                </SimpleDialog>
        
    }
}