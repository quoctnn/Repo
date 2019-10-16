import * as React from 'react';
import { ContextNaturalKey, IdentifiableObject, UserProfile, CommunityRole, RelationshipStatus, RequestErrorData, Permissible, Permission } from '../../../types/intrasocial_types';
import FormController, { FormComponentErrorMessage } from '../../form/FormController';
import { translate } from '../../../localization/AutoIntlProvider';
import { listPageSize, userFullName, userAvatar, uniqueId } from '../../../utilities/Utilities';
import ListComponent from '../ListComponent';
import classnames from 'classnames';
import { Checkbox } from '../input/Checkbox';
import { Button, Input } from 'reactstrap';
import { GenericListItem } from '../GenericListItem';
import { PaginationResult, ApiClient } from '../../../network/ApiClient';
import "./ContextMembersComponent.scss"
import { OverflowMenuItem, OverflowMenuItemType } from '../OverflowMenu';
import { DropDownMenu } from '../DropDownMenu';
import ColorMarkComponent from '../ColorMarkComponent';
import { ToastManager } from '../../../managers/ToastManager';
import { AuthenticationManager } from '../../../managers/AuthenticationManager';
import RoleBadgeComponent from '../RoleBadgeComponent';
import { EventSubscription } from 'fbemitter';
import { RoleManager } from './ContextRolesComponent';
import Avatar from '../Avatar';
import { TimeComponent } from '../TimeComponent';
import ContextInviteComponent from './ContextInviteComponent';

type MembersFilters = {
    search:string
}
type OwnProps = {
    contextNaturalKey:ContextNaturalKey
    contextObject:IdentifiableObject & Permissible
    roleManager:RoleManager
    members:number[]
    availableMembers:number[]
}
type State = {
    selected:number[]
    failed:number[]
    addMembersFormVisible:boolean
    addMembersFormReloadKey:string
    filters:MembersFilters
}
type Props = OwnProps
export default class ContextMembersComponent extends React.Component<Props, State> {
    formController:FormController = null
    listRef = React.createRef<ListComponent<UserProfile>>()
    authenticatedUser = AuthenticationManager.getAuthenticatedUser()
    reloadIdleTimeout: NodeJS.Timer = null
    private observers:EventSubscription[] = []
    private hasAccess = false
    private minimumPermission = Permission.moderate
    constructor(props:Props) {
        super(props);
        this.state = {
            selected:[],
            failed:[],
            addMembersFormVisible:false,
            addMembersFormReloadKey:uniqueId(),
            filters:{
                search:"",
            },
        }
        this.hasAccess = Permission.hasAccess(props.contextObject, this.minimumPermission)
        this.observers.push(props.roleManager.addRolesUpdatedObserver(this.handleRolesUpdated))
    }
    componentDidUpdate = (prevProps:Props) => {
        if(this.props.contextObject != prevProps.contextObject)
        {
            this.hasAccess = Permission.hasAccess(this.props.contextObject, this.minimumPermission)
            const list = this.getList()
            list && list.reload()
        }
    }
    getRoles = () => {
        return this.props.roleManager.getRoles()
    }
    componentWillUnmount = () => {
        this.observers.forEach(o => o.remove())
        this.observers = null;
    }
    handleRolesUpdated = () => {
        this.forceUpdate()
    }
    handleSelectionChange = (id: number, selected:boolean) => {
        const selectedItems = [...this.state.selected]
        selectedItems.toggleElement(id)
        this.setState((prevState:State) => {
            const failed = [...prevState.failed]
            if(!selected)
                failed.remove(id)
            return {selected:selectedItems, failed}
        })
    }
    toggleRole = (roleId:number, profileId:number) => (event:React.SyntheticEvent) => {
        event.preventDefault()
        event.stopPropagation()
        const role = this.getRoles().find(r => r.id == roleId)
        if(role)
        {
            const r = {...role}
            r.users.toggleElement(profileId)
            this.props.roleManager.updateRole(r)
            ApiClient.updateCommunityRole(role, (newRole, status, error) => {
                ToastManager.showRequestErrorToast(error)
                if(error)
                {
                    const role = this.getRoles().find(r => r.id == roleId)
                    if(role)
                    {
                        const r = {...role}
                        r.users.toggleElement(profileId)
                        this.props.roleManager.updateRole(r)
                    }
                }
                this.forceUpdate()
            })
        }
    }
    toggleModerate = (profile:UserProfile, relationToToggle:RelationshipStatus) => {
        const {contextNaturalKey, contextObject} = this.props
        const profileId = profile.id
        const relationship = profile.relationship || []
        const isAdmin = relationship.contains(relationToToggle)
        const add = !isAdmin ? [profileId] : undefined
        const remove = isAdmin ? [profileId] : undefined
        const list = this.getList()
        if(list)
        {
            const u = {...profile}
            relationship.toggleElement(relationToToggle)
            u.relationship = relationship
            list.updateItem(u)
        }
        const onComplete = (data:any, status:string, error: RequestErrorData) => {
            ToastManager.showRequestErrorToast(error)
            if(error)
            {
                const list = this.getList()
                if(list)
                {
                    const profile = list.getItemById(profileId)
                    const relationship = profile.relationship || []
                    const u = {...profile}
                    relationship.toggleElement(relationToToggle)
                    u.relationship = relationship
                    list.updateItem(u)
                }
            }
        }
        if(relationToToggle == RelationshipStatus.admin)
        {
            ApiClient.updateCommunityAdmin(contextObject.id, add, remove, onComplete)
        }
        else if(relationToToggle == RelationshipStatus.moderator)
        {
            ApiClient.updateContextModerators(contextNaturalKey, contextObject.id, add, remove, onComplete)
        }
        else if(relationToToggle == RelationshipStatus.manager)
        {
            ApiClient.updateContextManagers(contextNaturalKey, contextObject.id, add, remove, onComplete)
        }
    }
    toggleAdmin = (profile:UserProfile) => (event:React.SyntheticEvent) => {
        event.preventDefault()
        event.stopPropagation()
        this.toggleModerate(profile, RelationshipStatus.admin)
    }
    toggleModerator = (profile:UserProfile) => (event:React.SyntheticEvent) => {
        event.preventDefault()
        event.stopPropagation()
        this.toggleModerate(profile, RelationshipStatus.moderator)
    }
    toggleManager = (profile:UserProfile) => (event:React.SyntheticEvent) => {
        event.preventDefault()
        event.stopPropagation()
        this.toggleModerate(profile, RelationshipStatus.manager)
    }
    getMemberOptions = (profile:UserProfile) => {
        const {contextNaturalKey} = this.props
        const options: OverflowMenuItem[] = []
        const roles = this.getRoles()
        const relations = profile.relationship || []
        if(contextNaturalKey == ContextNaturalKey.COMMUNITY)
        {
            if(profile.id != this.authenticatedUser.id)
            {
                options.push({id:"admin", type:OverflowMenuItemType.option, className:"no-bg", title:translate("common.admin"), onPress:this.toggleAdmin(profile), children:<Checkbox className="mr-1" checked={relations.contains(RelationshipStatus.admin)}></Checkbox>})
            }
            options.push({id:"header1", type:OverflowMenuItemType.header, title:translate("common.roles")})
            roles.forEach(r => {

                options.push({id:"role" + r.id, type:OverflowMenuItemType.option, className:"no-bg", title:<div><ColorMarkComponent color={r.color} className="mr-1" />{r.role}</div>, onPress:this.toggleRole(r.id, profile.id), children:<Checkbox className="mr-1" checked={r.users.contains(profile.id)}></Checkbox>})
            })
        }
        else if(profile.id != this.authenticatedUser.id) {
            options.push({id:"moderator", type:OverflowMenuItemType.option, className:"no-bg", title:translate("common.moderator"), onPress:this.toggleModerator(profile), children:<Checkbox className="mr-1" checked={relations.contains(RelationshipStatus.moderator)}></Checkbox>})
            if(contextNaturalKey == ContextNaturalKey.PROJECT)
            {
                options.push({id:"manager", type:OverflowMenuItemType.option, className:"no-bg", title:translate("common.manager"), onPress:this.toggleManager(profile), children:<Checkbox className="mr-1" checked={relations.contains(RelationshipStatus.manager)}></Checkbox>})
            }
        }
       return options
    }
    contextRoleFilter = (role:CommunityRole) => {
        const {contextNaturalKey, contextObject} = this.props
        switch (contextNaturalKey) {
            case ContextNaturalKey.GROUP:return role.groups.contains(contextObject.id)
            case ContextNaturalKey.PROJECT:return role.projects.contains(contextObject.id)
            default:return false
        }
    }
    renderMemberFooter = (profile:UserProfile) => {
        const profileId = profile.id

        const roles = this.getRoles().filter(r => r.users.contains(profileId)).filter(this.contextRoleFilter)
        const arr = roles.map(r => <RoleBadgeComponent key={"role_" + r.id} title={r.role} color={r.color} />)
        if(arr.length == 0)
        {
            const date = profile.last_seen && new Date(profile.last_seen * 1000).toUTCString()
            if(date)
                arr.push(<span key="time"><span className="mr-1">{translate("common.seen")}</span><TimeComponent date={date} /></span> )
        }
        return arr
    }
    renderMemberHeader = (profile:UserProfile) => {
        const arr = []
        const relations = profile.relationship || []
        if(relations.contains(RelationshipStatus.owner))
            arr.push(<i title={RelationshipStatus.owner} key={RelationshipStatus.owner} className="fas fa-crown mr-1"></i>)
        if(relations.contains(RelationshipStatus.admin))
            arr.push(<i title={RelationshipStatus.admin} key={RelationshipStatus.admin} className="fas fa-user-shield mr-1"></i>)
        else if(relations.contains(RelationshipStatus.moderator))
            arr.push(<i title={RelationshipStatus.moderator} key={RelationshipStatus.moderator} className="fas fa-user-shield mr-1"></i>)
        if(relations.contains(RelationshipStatus.manager))
            arr.push(<i title={RelationshipStatus.manager} key={RelationshipStatus.manager} className="fas fa-user-ninja mr-1"></i>)
        arr.push(<div key="user" className="text-truncate">{userFullName(profile)}</div>)
        return arr
    }
    renderMember = (profile:UserProfile) =>  {
        const failedArray = this.state.failed
        const title = this.renderMemberHeader(profile)
        const failed = failedArray.contains( profile.id )
        const cn = classnames({"bg-warning":failed})
        const footer = this.renderMemberFooter(profile)
        const avatarUrl = userAvatar(profile)
        let right:React.ReactNode = undefined
        const memberOptions = this.hasAccess ? this.getMemberOptions(profile) : []
        right = memberOptions.length > 0 && <DropDownMenu closeOnSelect={false} className="community-member-option-dropdown" triggerClass="fas fa-ellipsis-v mx-1" items={memberOptions}></DropDownMenu>
        return <GenericListItem key={profile.id} to={profile.uri} className={cn} header={title} left={<Avatar size={44} image={avatarUrl} />} footer={footer} right={right}/>
    }
    fetchMembers = (offset:number, completion:(items:PaginationResult<UserProfile>) => (void)) => {
        let {search} = this.state.filters
        if(search.length == 0)
        {
            search = null
        }
        ApiClient.getContextMembers(this.props.contextNaturalKey, this.props.contextObject.id, listPageSize(44), offset, search,  (data) => {
            completion(data)
        })
    }
    getList = () => {
        return this.listRef && this.listRef.current
    }
    selectAll = () => {
        const list = this.getList()
        const items = list && list.getItems().map(i => i.id) || []
        this.setState(() => {
            return {selected:items}
        })
    }
    clearSelection = () => {
        this.setState(() => {
            return {selected:[]}
        })
    }
    headerToggle = () => {
        const selected = this.state.selected
        if(selected.length > 0)
        {
            this.clearSelection()
        }
        else 
            this.selectAll()
    }
    reloadList = () => {
        const list = this.getList()
        list && list.reload()
    }
    removeMembers = () => {
        const {contextObject} = this.props
        const {selected} = this.state
        ApiClient.updateProjectMembership(contextObject.id, undefined, selected, undefined, undefined, (response, status, error) => {
            if(!error)
                this.clearSelection()
            this.reloadList()
            this.props.roleManager.forceReload()
            ToastManager.showRequestErrorToast(error)
        })
    }
    kickMembers = () => {
        const {contextObject, contextNaturalKey} = this.props
        let ids = [...this.state.selected]
        ApiClient.kickContextMembers(ids, contextNaturalKey, contextObject.id, (response, status, error) => {
            if(!error)
                this.clearSelection()
            this.reloadList()
            this.props.roleManager.forceReload()
            ToastManager.showRequestErrorToast(error)
        })
    }
    showAddMembersForm = () => {
        this.setState((prevState:State) => {
            return {addMembersFormVisible:true, addMembersFormReloadKey:uniqueId()}
        })
    }
    hideAddMembersForm = () => {
        this.setState((prevState:State) => {
            return {addMembersFormVisible:false}
        })
    }
    handleAddMembersCompleted = () => {
        this.reloadList()
        this.hideAddMembersForm()
    }
    renderAddMemberForm = () => {
        const {members, availableMembers, contextObject} = this.props
        const visible = this.state.addMembersFormVisible
        return <ContextInviteComponent 
                    members={[]} 
                    availableMembers={availableMembers} 
                    contextNaturalKey={this.props.contextNaturalKey} 
                    key={this.state.addMembersFormReloadKey} 
                    onCompleted={this.handleAddMembersCompleted} 
                    didCancel={this.hideAddMembersForm} 
                    visible={visible} 
                    contextObject={contextObject} 
                    activeMembershipInvitations={members} 
                    />
    }
    renderHeaderButtons = () => {
        const {contextNaturalKey} = this.props
        const {selected} = this.state
        const headerActive = selected.length > 0
        if(headerActive)
        {
            if(contextNaturalKey == ContextNaturalKey.PROJECT)
            {
                return <Button onClick={this.removeMembers} className="ml-1 flex-shrink-0" size="xs" color="danger">
                        <i className="fas fa-trash mr-1"></i>{translate("common.remove")}
                    </Button>
            }
            else {

                return <Button onClick={this.kickMembers} className="ml-1 flex-shrink-0" size="xs" color="danger">
                        <i className="fas fa-trash mr-1"></i>{translate("common.kick")}
                    </Button>
            }
        }
        else if(contextNaturalKey == ContextNaturalKey.PROJECT){
            return <Button onClick={this.showAddMembersForm} className="ml-1 flex-shrink-0" size="xs" color="primary">
                    <i className="fas fa-plus mr-1"></i>{translate("common.add")}
                </Button>
        }
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
        const {selected} = this.state
        const headerActive = selected.length > 0
        const error = this.state.failed.length > 0 ? translate("form.member.delete.error") : undefined
        return <>
                {error && <FormComponentErrorMessage className="d-block" errors={{error}} />}
                <Input className="mb-2" value={this.state.filters.search} type="text" onChange={this.handleSearchInputChange} placeholder={translate("common.filter.members")}/>
                {this.hasAccess && <div className={classnames("list-header", {active:headerActive})}>
                    <Checkbox checked={headerActive} checkedIcon="fas fa-minus" onValueChange={this.headerToggle} />
                    <div className="flex-grow-1 text-truncate p-1">{translate("Member")}</div>
                    {this.renderHeaderButtons()}
                </div>}
                <ListComponent<UserProfile> 
                    ref={this.listRef}
                    fetchData={this.fetchMembers}
                    renderItem={this.renderMember}
                    loadMoreOnScroll={true}
                    onItemSelectionChange={this.handleSelectionChange}
                    selected={this.state.selected}
                    isSelecting={this.hasAccess}
                    findScrollParent={true}
                    clearDataBeforeFetch={false}
                />
                </>
    }
    render = () => {
        return <div className="context-members">
                    {this.renderList()}
                    {this.renderAddMemberForm()}
                </div>
    }
}