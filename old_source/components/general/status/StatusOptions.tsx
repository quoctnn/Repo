import StatusPermalinkDialog from './dialogs/StatusPermalinkDialog';
import * as React from 'react';
import { translate } from '../../../components/intl/AutoIntlProvider';
import EditStatusDialog from './dialogs/EditStatusDialog';
import { Status, UploadedFile } from '../../../types/intrasocial_types2';
import ConfirmDialog from '../dialogs/ConfirmDialog';
import { StatusActions } from './StatusComponent';
require("./StatusOptions.scss");
export interface Props
{
    status:Status
    canComment:boolean
    canMention:boolean
    canUpload:boolean
    onActionPress:(action:StatusActions, extra?:Object) => void
    isOwner:boolean
    communityId:number
}
interface State
{
    showEditDialog: boolean
    showDeleteDialog: boolean
    showPermalinkDialog: boolean
    showReportDialog: boolean
}
export default class StatusOptions extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            showEditDialog: false,
            showDeleteDialog: false,
            showPermalinkDialog: false,
            showReportDialog: false
        }
        this.toggleEditModal = this.toggleEditModal.bind(this)
        this.toggleDeleteModal = this.toggleDeleteModal.bind(this)
        this.togglePermalinkModal = this.togglePermalinkModal.bind(this)
        this.toggleReportModal = this.toggleReportModal.bind(this)
        this.save = this.save.bind(this)
        this.renderEditDialog = this.renderEditDialog.bind(this)
        this.renderRemoveDialog = this.renderRemoveDialog.bind(this)
        this.renderPermalinkDialog = this.renderPermalinkDialog.bind(this)
        this.renderReportDialog = this.renderReportDialog.bind(this)

    }
    shouldComponentUpdate(nextProps:Props, nextState:State)
    {
        return nextProps.status.id != this.props.status.id ||
                nextProps.status.updated_at != this.props.status.updated_at ||
                nextState.showEditDialog != this.state.showEditDialog ||
                nextState.showDeleteDialog != this.state.showDeleteDialog ||
                nextState.showPermalinkDialog != this.state.showPermalinkDialog ||
                nextState.showReportDialog != this.state.showReportDialog
    }
    onConfirmDelete = (success:boolean) => {
        this.toggleDeleteModal()
        if(success)
        {
            this.props.onActionPress(StatusActions.delete)
        }
    }
    renderEditDialog()
    {
        return (
            <EditStatusDialog
                communityId={this.props.communityId}
                didCancel={this.toggleEditModal}
                canUpload={this.props.canUpload}
                canComment={this.props.canComment}
                visible={this.state.showEditDialog} ref="editStatusDialog"
                status={this.props.status}
                onSave={this.save} canMention={this.props.canMention} />
        )
    }
    save(status:Status, files:UploadedFile[]) {
        this.setState({showEditDialog:false}, () => {
            this.props.onActionPress(StatusActions.edit,{status:status, files:files} )
        })
    }
    renderRemoveDialog()
    {
        const title = translate("Confirm deletetion")
        const message = this.props.status.parent ? translate("Are you sure you want to delete this comment?") :
                                                   translate("Are you sure you want to delete this status?")
        const okButtonTitle = translate("Yes")
        return <ConfirmDialog visible={this.state.showDeleteDialog} title={title} message={message} didComplete={this.onConfirmDelete} okButtonTitle={okButtonTitle}/>
    }
    renderPermalinkDialog()
    {
        return (
            <StatusPermalinkDialog visible={this.state.showPermalinkDialog}
            didCancel={this.togglePermalinkModal} statusId={this.props.status.id}
                ref="permalinkDialog" />
        )
    }
    renderReportDialog()
    {

    }
    toggleEditModal() {
        this.setState( (previousState, currentProps) => {
            return { showEditDialog: !previousState.showEditDialog };
        });
    }

    toggleDeleteModal() {
        this.setState( (previousState, currentProps) => {
            return { showDeleteDialog: !previousState.showDeleteDialog };
        });
    }

    togglePermalinkModal() {
        this.setState( (previousState, currentProps) => {
            return { showPermalinkDialog: !previousState.showPermalinkDialog };
        });
    }
    toggleReportModal() {
        this.setState( (previousState, currentProps) => {
            return { showReportDialog: !previousState.showReportDialog };
        });
    }
    render()
    {
        return (
            <span className="status-options">
                <span className="dropdown dropdown-options">
                    <button className="btn dropdown-toggle" data-toggle="dropdown" data-boundary="body">
                        <i className="fa fa-ellipsis-h btn-options"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-right">
                        {this.props.isOwner && this.props.canComment &&
                            <li>
                                <a onClick={this.toggleEditModal} className="clickable">
                                    <i className="fa fa-edit"></i>
                                    {translate("Edit")}
                                </a>
                            </li>
                        }
                        {this.props.isOwner && this.props.canComment &&
                            <li>
                                <a onClick={this.toggleDeleteModal} className="clickable">
                                    <i className="fa fa-trash"></i>
                                    {translate("Delete")}
                                </a>
                            </li>
                        }
                        {!this.props.isOwner &&
                            <li>
                                <a onClick={this.toggleReportModal} className="clickable">
                                    <i className="fa fa-exclamation-triangle"></i>
                                    {translate("Report")}
                                </a>
                            </li>
                        }

                        <li>
                            <a onClick={this.togglePermalinkModal} className="clickable">
                                <i className="fa fa-link"></i>
                                    {translate("Show Permalink")}
                            </a>
                        </li>
                    </ul>
                </span>
                {this.renderEditDialog()}
                {this.renderRemoveDialog()}
                {this.renderPermalinkDialog()}
                {this.renderReportDialog()}
            </span>
        )
    }
}