import * as React from 'react';
import { ModalBody, Modal, ModalHeader, ModalFooter, Button } from 'reactstrap';
import { translate } from '../../../../components/intl/AutoIntlProvider';
import { Status } from '../../../../reducers/statuses';
import StatusEditFormContainer from '../StatusEditFormContainer';
import { UploadedFile } from '../../../../reducers/conversations';
require("./EditStatusDialog.scss");

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
            onDidType={() => {}}
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
                    {translate("Edit")}
                    <button type="button" className="close" onClick={this.props.didCancel}
                        data-dismiss="modal">
                        <span aria-hidden="true">&times;</span>
                        <span className="sr-only">Close</span>
                    </button>
                    
                </ModalHeader>
                <ModalBody className="vertical-scroll">
                    {this.renderForm()}
                </ModalBody>
                <ModalFooter>
                </ModalFooter>
            </Modal>)
    }
}