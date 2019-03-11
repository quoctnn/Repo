import * as React from 'react';
import { ModalBody, Modal, ModalHeader, ModalFooter } from 'reactstrap';
import { Status, UploadedFile } from '../../../types/intrasocial_types';
import StatusEditFormContainer from '../../general/StatusEditFormContainer';
import { translate } from '../../../localization/AutoIntlProvider';

import "./EditStatusDialog.scss"

export interface Props 
{
    visible:boolean
    status:Status
    canMention:boolean
    canComment:boolean
    canUpload:boolean
    onSave:(status: Status, files: UploadedFile[]) => void
    didCancel:() => void
    communityId:number
}
interface State 
{
}
export default class EditStatusDialog extends React.Component<Props, State> {  
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    renderForm() {
        
        return (<StatusEditFormContainer 
            communityId={this.props.communityId}
            canComment={this.props.canComment}
            canUpload={this.props.canUpload}
            status={this.props.status}
            canMention={this.props.canMention || false}
            onStatusSubmit={this.props.onSave} />)
    }
    render()
    {
        return (<Modal toggle={this.props.didCancel} id="edit-status-dialog" zIndex={1070} isOpen={this.props.visible} className="full-height">
                <ModalHeader>
                    <button type="button" className="close" onClick={this.props.didCancel}
                        data-dismiss="modal">
                        <span aria-hidden="true">&times;</span>
                        <span className="sr-only">Close</span>
                    </button>
                    <span>{translate("Edit")}</span>
                </ModalHeader>
                <ModalBody className="vertical-scroll">
                    {this.renderForm()}
                </ModalBody>
                <ModalFooter>
                </ModalFooter>
            </Modal>)
    }
}