import * as React from 'react';
import { translate } from '../../../localization/AutoIntlProvider';
import { ContextRequest, IdentifiableObject, ContextNaturalKey, UserProfile, Permissible } from '../../../types/intrasocial_types';
import { ProfileManager } from '../../../managers/ProfileManager';
import { ApiClient, PaginationResult } from '../../../network/ApiClient';
import ListComponent from '../ListComponent';
import Button from 'reactstrap/lib/Button';
import { GenericListItem } from '../GenericListItem';
import { TimeComponent } from '../TimeComponent';
import { Checkbox } from '../input/Checkbox';
import "./ContextRequestComponent.scss"
import classnames from 'classnames';
import { userFullName, listPageSize, uniqueId } from '../../../utilities/Utilities';
import { Input } from 'reactstrap';
import { FormComponentErrorMessage } from '../../form/FormController';
import UserProfileAvatar from '../UserProfileAvatar';
type OwnProps = {
    contextNaturalKey: ContextNaturalKey
    contextObject: IdentifiableObject & Permissible
    members: number[]
    availableMembers: number[]
}
type RequestFilters = {
    search: string
}
type State = {
    selectedRequests: number[]
    filters: RequestFilters
    failed: number[]
}
type Props = OwnProps
export default class ContextRequestComponent extends React.Component<Props, State> {
    listRef = React.createRef<ListComponent<ContextRequest>>()
    reloadIdleTimeout: NodeJS.Timer = null
    constructor(props: Props) {
        super(props);
        this.state = {
            selectedRequests: [],
            filters: {
                search: "",
            },
            failed: []
        }
    }
    componentDidUpdate = (prevProps: Props) => {
        if (this.props.contextObject != prevProps.contextObject) {
            const list = this.getList()
            list && list.reload()
        }
    }
    renderRequestHeader = (profile: UserProfile, request: ContextRequest) => {
        const arr = []
        arr.push(<div key="user" className="text-truncate">{userFullName(profile)}</div>)
        return arr
    }
    renderRequest = (request: ContextRequest) => {
        const failedArray = this.state.failed
        const profile = request.user && ProfileManager.getProfileById(request.user)
        const title = this.renderRequestHeader(profile, request)
        const failed = failedArray.contains(request.id)
        const cn = classnames({ "bg-warning": failed })
        return <GenericListItem className={cn} header={title} left={<UserProfileAvatar size={40} borderWidth={2} borderColor="white" profileId={profile.id} />} footer={<TimeComponent date={request.created_at} />} />
    }
    fetchRequests = (offset: number, completion: (items: PaginationResult<ContextRequest>) => (void)) => {
        let { search } = this.state.filters
        if (search.length == 0) {
            search = null
        }
        ApiClient.getContextMembershipRequests(this.props.contextNaturalKey, this.props.contextObject.id, listPageSize(44), offset, search, (data) => {
            completion(data)
        })
    }
    handleSelectionChange = (id: number, selected: boolean) => {
        const selectedItems = [...this.state.selectedRequests]
        selectedItems.toggleElement(id)
        this.setState((prevState: State) => {
            const failed = [...prevState.failed]
            if (!selected)
                failed.remove(id)
            return { selectedRequests: selectedItems, failed }
        })
    }
    getList = () => {
        return this.listRef && this.listRef.current
    }
    selectAll = () => {
        const list = this.getList()
        const items = list && list.getItems().map(i => i.id) || []
        this.setState(() => {
            return { selectedRequests: items }
        })
    }
    clearSelection = () => {
        this.setState(() => {
            return { selectedRequests: [] }
        })
    }
    headerToggle = () => {
        const selected = this.state.selectedRequests
        if (selected.length > 0) {
            this.clearSelection()
        }
        else
            this.selectAll()
    }
    reloadList = () => {
        const list = this.getList()
        list && list.reload()
    }
    handleInviteCompleted = () => {
        this.reloadList()
    }
    acceptRequests = () => {
        let ids = [...this.state.selectedRequests]
        ApiClient.acceptContextMembershipRequests(this.props.contextNaturalKey, ids, (response, status, error) => {
            const errors = response && response.failed || []
            const selected = errors.map(f => f.accept)
            const failed = [...selected]
            if(error && failed.length == 0)
                failed.push(-1)// show default error
            this.setState(() => {
                return {failed, selectedRequests:selected}
            }, this.reloadList)
        })
    }
    deleteRequests = () => {
        let ids = [...this.state.selectedRequests]
        ApiClient.deleteContextMembershipRequests(this.props.contextNaturalKey, ids, (response, status, error) => {
            const errors = response && response.failed || []
            const selected = errors.map(f => f.delete)
            const failed = [...selected]
            if(error && failed.length == 0)
                failed.push(-1)// show default error
            this.setState(() => {
                return {failed, selectedRequests:selected}
            }, this.reloadList)
        })
    }

    handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        this.setState((prevState: State) => {
            const filters = { ...prevState.filters }
            filters.search = value
            return { filters }
        }, this.reloadListOnIdle)
    }
    reloadListOnIdle = () => {
        if (this.reloadIdleTimeout)
            clearTimeout(this.reloadIdleTimeout)
        this.reloadIdleTimeout = setTimeout(this.reloadList, 300)
    }
    renderList = () => {
        const { selectedRequests } = this.state
        const headerActive = selectedRequests.length > 0
        const error = this.state.failed.length > 0 ? translate("form.request.delete.error") : undefined
        return <>
            {error && <FormComponentErrorMessage className="d-block" errors={{ error }} />}
            <Input className="mb-2" value={this.state.filters.search} type="text" onChange={this.handleSearchInputChange} placeholder={translate("common.filter.requests")} />
            <div className={classnames("list-header", { active: headerActive })}>
                <Checkbox checked={headerActive} checkedIcon="fas fa-minus" onValueChange={this.headerToggle} />
                <div className="flex-grow-1 text-truncate m-1 p-2">{translate("common.request")}</div>
                {headerActive && <>
                    <Button onClick={this.acceptRequests} className="ml-1 flex-shrink-0" size="xs" color="success">
                        <i className="fas fa-check mr-1"></i>{translate("invitation.accept")}
                    </Button>
                    <Button onClick={this.deleteRequests} className="ml-1 flex-shrink-0" size="xs" color="danger">
                        <i className="fas fa-trash mr-1"></i>{translate("common.delete")}
                    </Button></>
                }
            </div>
            <ListComponent<ContextRequest>
                ref={this.listRef}
                fetchData={this.fetchRequests}
                renderItem={this.renderRequest}
                loadMoreOnScroll={true}
                onItemSelectionChange={this.handleSelectionChange}
                selected={this.state.selectedRequests}
                isSelecting={true}
                findScrollParent={true}
                clearDataBeforeFetch={false}
            />
        </>
    }
    render = () => {
        return <div className="context-request">
            {this.renderList()}
        </div>

    }
}