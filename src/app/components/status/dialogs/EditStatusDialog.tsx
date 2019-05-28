import * as React from 'react';
import { ModalBody, Modal, ModalHeader, ModalFooter } from 'reactstrap';
import { Status, UploadedFile } from '../../../types/intrasocial_types';
import { translate } from '../../../localization/AutoIntlProvider';

import "./EditStatusDialog.scss"
import StatusEditorComponent from '../../general/input/StatusEditorComponent';
import SimpleDialog from '../../general/dialogs/SimpleDialog';

export interface Props 
{
    visible:boolean
    status:Status
    canMention:boolean
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
    render()
    {
        return <SimpleDialog header={translate("Edit")} didCancel={this.props.didCancel} visible={this.props.visible}>
            <StatusEditorComponent 
                    communityId={this.props.communityId}
                    canUpload={this.props.canUpload}
                    status={this.props.status}
                    canMention={this.props.canMention || false}
                    onStatusSubmit={this.props.onSave}
                />
        </SimpleDialog>
    }
}