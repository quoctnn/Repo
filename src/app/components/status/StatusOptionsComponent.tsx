
import * as React from 'react';
import { StatusActions, Status, UploadedFile, ObjectAttributeType, SimpleObjectAttribute, Permission } from '../../types/intrasocial_types';
import { translate } from '../../localization/AutoIntlProvider';
import "./StatusOptionsComponent.scss"
import EditStatusDialog from './dialogs/EditStatusDialog';
import ConfirmDialog from '../general/dialogs/ConfirmDialog';
import { OverflowMenuItem, OverflowMenu, OverflowMenuItemType } from '../general/OverflowMenu';
import classnames from 'classnames';
import { PermissionManager } from '../../managers/PermissionManager';
import { ToastManager } from '../../managers/ToastManager';
import { StatusUtilities } from '../../utilities/StatusUtilities';
import { IntraSocialUtilities } from '../../utilities/IntraSocialUtilities';
import ReportStatusDialog from './dialogs/ReportStatusDialog';
import SelectUsersDialog from '../general/dialogs/SelectUsersDialog';
import { CommunityManager } from '../../managers/CommunityManager';
import { ProfileManager } from '../../managers/ProfileManager';
type Props = {
    className?:string
    status:Status
    canMention:boolean
    canUpload:boolean
    onActionPress:(action:StatusActions, extra?:Object, completion?:(success:boolean) => void) => void
    isOwner:boolean
    isComment:boolean
    communityId:number
    maxVisible:number
    overflowButtonClass?:string
}
type State = {
    showEditDialog: boolean
    showDeleteDialog: boolean
    showReportDialog: boolean
    showAttentionDialog: boolean
    selectedMembers:number[]
}
export default class StatusOptionsComponent extends React.Component<Props, State> {
    constructor(props:Props) {
        super(props);
        this.state = {
            showEditDialog: false,
            showDeleteDialog: false,
            showReportDialog: false,
            showAttentionDialog:false,
            selectedMembers:[]
        }
    }
    nextAttributesEqual = (attributes:SimpleObjectAttribute[]) => {
        const a = attributes || []
        const b = this.props.status.attributes || []
        return a.isEqual(b)
    }
    shouldComponentUpdate = (nextProps:Props, nextState:State) => {
        const updated = nextProps.status.id != this.props.status.id ||
                nextProps.status.updated_at != this.props.status.updated_at ||
                nextProps.status.serialization_date != this.props.status.serialization_date ||
                nextState.showEditDialog != this.state.showEditDialog ||
                nextState.showDeleteDialog != this.state.showDeleteDialog ||
                nextState.showReportDialog != this.state.showReportDialog || 
                nextState.showAttentionDialog != this.state.showAttentionDialog || 
                !nextState.selectedMembers.isEqual(this.state.selectedMembers) || 
                !this.nextAttributesEqual(nextProps.status.attributes)
        return updated
    }
    onConfirmDelete = (success:boolean) => {
        this.toggleDeleteModal()
        if(success)
        {
            this.props.onActionPress(StatusActions.delete)
        }
    }
    save = (status:Status, files:UploadedFile[]) => {
        this.setState({showEditDialog:false}, () => {
            this.props.onActionPress(StatusActions.edit,{status:status, files:files} )
        })
    }
    renderRemoveDialog = () => {
        const visible = this.state.showDeleteDialog
        if(!visible)
            return null
        const title = translate("Confirm deletetion")
        const message = this.props.status.parent ? translate("Are you sure you want to delete this comment?") :
                                                   translate("Are you sure you want to delete this status?")
        const okButtonTitle = translate("common.yes")
        return <ConfirmDialog visible={visible} title={title} message={message} didComplete={this.onConfirmDelete} okButtonTitle={okButtonTitle}/>
    }
    renderEditDialog = () => {
        const visible = this.state.showEditDialog
        if(!visible)
            return null
        return (
            <EditStatusDialog
                communityId={this.props.communityId}
                didCancel={this.toggleEditModal}
                canUpload={this.props.canUpload}
                visible={visible} ref="editStatusDialog"
                status={this.props.status}
                onSave={this.save} 
                canMention={this.props.canMention} />
        )
    }
    renderReportDialog = () => {

        const visible = this.state.showReportDialog
        if(!visible)
            return null
        return <ReportStatusDialog 
                    status={this.props.status} 
                    visible={visible}
                    didCancel={this.toggleReportModal}
                    />
    }
    createAttentionComplete = () => {
        const user = this.state.selectedMembers[0]
        this.props.onActionPress(StatusActions.createAttribute, {type:ObjectAttributeType.attention, user}, () => {
            this.closeAttentionModal()
        })
    }
    createAttentionValueChanged = (selectedMembers: number[]) => {
        this.setState({selectedMembers})
    }
    renderAttentionDialog = () => {
        const visible = this.state.showAttentionDialog 
        if(!visible)
            return null
        let contacts = []
        const communityId = this.props.status.community && this.props.status.community.id
        if(communityId)
        {
            const community = CommunityManager.getCommunityById(communityId)
            if(community)
            {
                contacts = ProfileManager.getProfiles(community.members)
            }
        }
        return <SelectUsersDialog 
                    contacts={contacts}
                    title={translate("status.dialog.attention.title")}
                    visible={visible}
                    didCancel={this.closeAttentionModal}
                    didSubmit={this.createAttentionComplete}
                    valueChanged={this.createAttentionValueChanged}
                    canSubmit={this.state.selectedMembers.length > 0}
                    selected={this.state.selectedMembers}
                    singleSelect={true}
                    />
    }
    showCopied = () => 
    {
        ToastManager.showInfoToast(translate("Link copied!"))
    }
    toggleEditModal = () => {
        this.setState( (previousState, currentProps) => {
            return { showEditDialog: !previousState.showEditDialog };
        });
    }

    toggleDeleteModal = () => {
        this.setState( (previousState, currentProps) => {
            return { showDeleteDialog: !previousState.showDeleteDialog };
        });
    }

    copyLink = () => {

        let permaLink = StatusUtilities.getPermaLink(this.props.status.id)
        IntraSocialUtilities.copyToClipboard(permaLink)
        this.showCopied()
    }
    toggleReportModal = () => {
        this.setState( (previousState, currentProps) => {
            return { showReportDialog: !previousState.showReportDialog };
        });
    }
    closeAttentionModal = () => {
        this.setState({showAttentionDialog:false})
    }
    toggleAttentionModal = () => { 
        const attributes = this.props.status.attributes || []
        const active = attributes.find(a => a.attribute == ObjectAttributeType.attention)
        if(active)
        {
            this.props.onActionPress(StatusActions.deleteAttribute, {id:active.id})
        }
        else {
            //open/close dialog
            this.setState( (previousState, currentProps) => {
                return { showAttentionDialog: !previousState.showAttentionDialog, selectedMembers:[] };
            });
        }
    }
    toggleAttribute = (attribute:ObjectAttributeType) => {
        const attributes = this.props.status.attributes || []
        const active = attributes.find(a => a.attribute == attribute)
        if(active)
            this.props.onActionPress(StatusActions.deleteAttribute, {id:active.id})
        else 
            this.props.onActionPress(StatusActions.createAttribute, {type:attribute})
    }
    toggleStar = () => {
        this.toggleAttribute(ObjectAttributeType.important)
    }
    togglePinned = () => {
        this.toggleAttribute(ObjectAttributeType.pinned)
    }
    toggleFollow = () => {

        this.toggleAttribute(ObjectAttributeType.follow)
    }
    fetchItems = () => {

        const status = this.props.status
        const attributes = status.attributes || []
        const items:OverflowMenuItem[] = [] 
        if((this.props.isOwner && status.permission >= Permission.post) || status.permission >= Permission.moderate)
        {
            const shieldClass =  Permission.usesElevatedPrivileges(status.permission) ? "fas fa-shield-alt" : undefined
            items.push({id:"1",title:translate("Delete"), iconClass:"fa fa-trash", iconStackClass:shieldClass, onPress:this.toggleDeleteModal, type:OverflowMenuItemType.option})
            if(status.permission == Permission.update)
                items.push({id:"0", title:translate("Edit"), iconClass:"fa fa-edit", onPress:this.toggleEditModal, type:OverflowMenuItemType.option})
        }
        if(!this.props.isOwner)
            items.push({id:"2",title:translate("Report"), iconClass:"fa fa-exclamation-triangle", onPress:this.toggleReportModal, type:OverflowMenuItemType.option})
        items.push({id:"3",title:translate("Copy link"), iconClass:"fa fa-link", onPress:this.copyLink, type:OverflowMenuItemType.option})
        if(!this.props.isComment)
        {
            //follow
            const following = !!attributes.find(a => a.attribute == ObjectAttributeType.follow)
            items.push({id:"4",title:translate(following ? "Unfollow": "Follow"), iconClass:ObjectAttributeType.iconForType(ObjectAttributeType.follow, following) , onPress:this.toggleFollow, toggleMenu:false, type:OverflowMenuItemType.option})
            //star
            const starred = !!attributes.find(a => a.attribute == ObjectAttributeType.important)
            items.push({id:"5",title:translate(starred ? "Unstar item": "Star item"), iconClass:ObjectAttributeType.iconForType(ObjectAttributeType.important, starred), onPress:this.toggleStar, toggleMenu:false, type:OverflowMenuItemType.option})
            
            const permission = PermissionManager.permissionForStatus(this.props.status)
            if(permission == Permission.admin)
            {
                //pinning
                const pinned = !!attributes.find(a => a.attribute == ObjectAttributeType.pinned)
                items.push({id:"6",title:translate(pinned ? "Unpin item": "Pin item"), iconClass:ObjectAttributeType.iconForType(ObjectAttributeType.pinned, pinned), onPress:this.togglePinned, toggleMenu:false, type:OverflowMenuItemType.option})
                //attention
                const attention = !!attributes.find(a => a.attribute == ObjectAttributeType.attention)
                items.push({id:"7",title:translate(attention ? "Remove attention": "Add attention"), iconClass:ObjectAttributeType.iconForType(ObjectAttributeType.attention, attention), onPress:this.toggleAttentionModal, toggleMenu:false, type:OverflowMenuItemType.option})
            }
        }
        return items
    }
    render = () => {
        const cn = classnames("status-options", this.props.className)
        const overflowButtonClass = this.props.overflowButtonClass || "fas fa-ellipsis-v"
        return (
            <span className={cn}>
                <span className="dropdown dropdown-options">
                    <OverflowMenu refresh={this.props.status.serialization_date} fetchItems={this.fetchItems} maxVisible={this.props.maxVisible} buttonIconClass={overflowButtonClass} />
                </span>
                {this.renderEditDialog()}
                {this.renderRemoveDialog()}
                {this.renderReportDialog()}
                {this.renderAttentionDialog()}
            </span>
        )
    }
}