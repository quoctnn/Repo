import * as React from 'react';
import { ContextNaturalKey, IdentifiableObject, CommunityRole, Community, RelationshipStatus, Permissible } from '../../../types/intrasocial_types';
import FormController, { FormComponentErrorMessage } from '../../form/FormController';
import { translate } from '../../../localization/AutoIntlProvider';
import ContextRoleCreator from './ContextRoleCreator';
import { uniqueId } from '../../../utilities/Utilities';
import ListComponent from '../ListComponent';
import classnames from 'classnames';
import { Checkbox } from '../input/Checkbox';
import { Button } from 'reactstrap';
import { GenericListItem } from '../GenericListItem';
import { PaginationResult, ApiClient } from '../../../network/ApiClient';
import "./ContextRolesComponent.scss"
import StackedAvatars from '../StackedAvatars';
import ColorMarkComponent from '../ColorMarkComponent';
import {EventEmitter, EventSubscription} from "fbemitter"
import { ToastManager } from '../../../managers/ToastManager';

export class RoleManager{
    private roles:CommunityRole[] = []
    private community:number
    private emitter = new EventEmitter()
    private rolesUpdatedKey = "rolesUpdatedKey"
    constructor(community:number){
        this.community = community
    }
    getRoles = () => {
        return [...this.roles]
    }
    forceReload = () => {
        this.fetchRoles(0, () => {

        })
    }
    fetchRoles = (offset:number, completion:(items:PaginationResult<CommunityRole>) => (void)) => {
        ApiClient.getCommunityRoles(this.community, 50, offset,  (data, status, error) => {
            const newRoles = data && data.results || []
            if(newRoles)
            {
                if(offset == 0)
                    this.roles = newRoles
                else
                    this.roles.push(...newRoles)
                this.emitter.emit(this.rolesUpdatedKey, this.roles)
            }
            completion(data)
        })
    }
    updateRole = (role:CommunityRole) => {
        const index = this.roles.findIndex(r => r.id == role.id)
        if(index > -1)
        {
            this.roles[index] = role
            this.emitter.emit(this.rolesUpdatedKey, this.roles)
        }
    }
    addRolesUpdatedObserver(listener: (roles:CommunityRole[]) => void):EventSubscription
    {
        return this.emitter.addListener(this.rolesUpdatedKey, listener)
    }
}
type OwnProps = {
    contextNaturalKey:ContextNaturalKey
    contextObject:IdentifiableObject & Permissible
    community:Community
    onRolesUpdate?:(roles:CommunityRole[]) => void
    roleManager:RoleManager
}
type State = {
    createFormVisible:boolean
    createFormReloadKey:string
    selected:number[]
    failed:number[]
    edit:CommunityRole
    updatesInProgress:number[]
}
type Props = OwnProps
export default class ContextRolesComponent extends React.Component<Props, State> {
    formController:FormController = null
    listRef = React.createRef<ListComponent<CommunityRole>>()
    private observers:EventSubscription[] = []
    constructor(props:Props) {
        super(props);
        this.state = {
            createFormVisible:false,
            createFormReloadKey:uniqueId(),
            selected:[],
            failed:[],
            edit:null,
            updatesInProgress:[]
        }
        this.observers.push(props.roleManager.addRolesUpdatedObserver(this.handleRolesUpdated))
    }
    componentWillUnmount = () => {
        this.observers.forEach(o => o.remove())
        this.observers = null;
    }
    handleRolesUpdated = (roles:CommunityRole[]) => {
        const list = this.getList()
        list && list.setItems(roles)
        const selected = roles.filter(this.contextRoleFilter).map(r => r.id)
        this.setState(() => {
            return {selected}
        })
    }
    contextRoleFilter = (role:CommunityRole) => {
        const {contextNaturalKey, contextObject} = this.props
        switch (contextNaturalKey) {
            case ContextNaturalKey.GROUP:return role.groups.contains(contextObject.id)
            case ContextNaturalKey.PROJECT:return role.projects.contains(contextObject.id)
            default:return false
        }
    }
    showCreateForm = () => {
        this.setState((prevState:State) => {
            return {createFormVisible:true, createFormReloadKey:uniqueId()}
        })
    }
    hideCreateForm = () => {
        this.setState((prevState:State) => {
            return {createFormVisible:false, edit:null}
        })
    }
    handleSelectionChange = (id: number, selected:boolean) => {
        const selectedItems = [...this.state.selected]
        selectedItems.toggleElement(id)
        const isCommunityContext = this.isCommunityContext()
        if(isCommunityContext)
        {
            this.setState((prevState:State) => {
                return {selected:selectedItems}
            })
        }
        else{
            const inProgress = [...this.state.updatesInProgress]
            if(inProgress.contains(id))
                return
            inProgress.push(id)
            this.setState((prevState:State) => {
                const failed = [...prevState.failed]
                if(!selected)
                    failed.remove(id)
                return {selected:selectedItems, failed, updatesInProgress:inProgress}
            }, this.sendRoleSelectionUpdate(id, selected))
        }

    }
    sendRoleSelectionUpdate = (id:number, selected:boolean) => () => {
        const {contextNaturalKey, contextObject} = this.props
        const add = selected ? [id] : undefined
        const remove = !selected ? [id] : undefined
        ApiClient.updateContextRoles(contextNaturalKey, contextObject.id, add, remove, (data, status, error) => {
            ToastManager.showRequestErrorToast(error)
            const inProgress = [...this.state.updatesInProgress]
            inProgress.remove(id)
            if(error)
            {
                const selectedItems = [...this.state.selected]
                selectedItems.toggleElement(id)
                this.setState((prevState:State) => {
                    const failed = [...prevState.failed]
                    failed.push(id)
                    return {selected:selectedItems, failed, updatesInProgress:inProgress}
                })
            }
            else {
                this.props.roleManager.forceReload()
                this.setState((prevState:State) => {
                    return {updatesInProgress:inProgress}
                })
            }
        })
    }
    editRole = (role:CommunityRole) => (e:React.SyntheticEvent) => {
        this.setState((prevState:State) => {
            return {createFormVisible:true, edit:role, createFormReloadKey:uniqueId()}
        })
    }
    renderRoleHeader = (role:CommunityRole) => {
        const arr = []
        arr.push(<div key="title" className="d-flex align-items-center mr-1 mw0">
                        <ColorMarkComponent color={role.color} className="mr-1" />
                        <div className="text-truncate">{role.role}</div>
                    </div>)
        if(role.moderator)
            arr.push(<i title={RelationshipStatus.admin} key={RelationshipStatus.admin} className="fas fa-user-shield mr-1"></i>)
        if(role.manager)
            arr.push(<i title={RelationshipStatus.manager} key={RelationshipStatus.manager} className="fas fa-user-ninja mr-1"></i>)
        return arr
    }
    renderRole = (role:CommunityRole) =>  {
        const failedArray = this.state.failed
        const title = this.renderRoleHeader(role)
        const failed = failedArray.contains( role.id )
        const cn = classnames({"bg-warning":failed})
        const users = role.users || []
        const updateKey = users.join(",")
        const footer = users.length > 0 ? <StackedAvatars className="text-truncate d-block" key={updateKey} showTextOnly={true} size={20} userIds={users} showOverflowCount={true} /> : <div className="text-truncate">{translate("role.users.empty")}</div>
        const canEditRole = this.isCommunityContext()
        const action = canEditRole ? this.editRole(role) : undefined
    return <GenericListItem onClick={action} className={cn} left={<></>} header={title} footer={<div className="mw0">{footer}</div>}/>
    }
    fetchRoles = (offset:number, completion:(items:PaginationResult<CommunityRole>) => (void)) => {
        this.props.roleManager.fetchRoles(offset, (data) => {
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
    deleteRoles = () => {
        let ids = [...this.state.selected]
        ApiClient.deleteCommunityRoles(ids, (response, status, error) => {
            const errors = response && response.failed || []
            const selected = errors.map(f => f.delete)
            const failed = [...selected]
            if(error && failed.length == 0)
                failed.push(-1)// show default error
            this.setState(() => {
                return {failed:failed, selected:selected}
            }, this.reloadList)
        })
    }
    handleRoleCreateComplete = (role:CommunityRole) => {
        this.reloadList()
        this.hideCreateForm()
    }
    handleDataLoaded = () => {
        const list = this.getList()
        if(list)
            this.props.onRolesUpdate && this.props.onRolesUpdate(list.getItems())
    }
    isCommunityContext = () => {
        return this.props.contextNaturalKey == ContextNaturalKey.COMMUNITY
    }
    renderListHeader = () => {
        const {selected} = this.state
        const headerActive = selected.length > 0
        const isCommunityContext = this.isCommunityContext()
        return  <div className={classnames("list-header", {active:headerActive})}>
                    <Checkbox checked={headerActive} checkedIcon="fas fa-minus" onValueChange={this.headerToggle} />
                    <div className="flex-grow-1 text-truncate m-1 p-2">{translate("common.role")}</div>
                    {headerActive &&
                        <Button onClick={this.deleteRoles} className="ml-1 flex-shrink-0" size="xs" color="danger">
                            <i className="fas fa-trash mr-1"></i>{translate("common.delete")}
                        </Button>
                    }
                    {!headerActive && isCommunityContext &&
                        <Button onClick={this.showCreateForm} className="ml-1 flex-shrink-0" size="xs" color="primary">
                            <i className="fas fa-plus mr-1"></i>{translate("common.create.role")}
                        </Button>
                    }
                </div>
    }
    renderList = () => {
        const error = this.state.failed.length > 0 ? translate("form.role.delete.error") : undefined
        const renderHeader = this.isCommunityContext()
        return <>
                {error && <FormComponentErrorMessage className="d-block" errors={{error}} />}
                {renderHeader && this.renderListHeader()}
                <ListComponent<CommunityRole>
                    ref={this.listRef}
                    fetchData={this.fetchRoles}
                    renderItem={this.renderRole}
                    loadMoreOnScroll={true}
                    onItemSelectionChange={this.handleSelectionChange}
                    selected={this.state.selected}
                    isSelecting={true}
                    findScrollParent={true}
                    clearDataBeforeFetch={false}
                    onDidLoadData={this.handleDataLoaded}
                />
                </>
    }
    renderCreateRoleForm = () => {
        const {createFormVisible, createFormReloadKey, edit} = this.state
        const {contextNaturalKey, community} = this.props
        return <ContextRoleCreator onComplete={this.handleRoleCreateComplete} community={community} role={edit} contextNaturalKey={contextNaturalKey} key={createFormReloadKey} didCancel={this.hideCreateForm} visible={createFormVisible} />
    }
    render = () => {
        return <div className="context-roles">
                    {this.renderList()}
                    {this.renderCreateRoleForm()}
                </div>
    }
}