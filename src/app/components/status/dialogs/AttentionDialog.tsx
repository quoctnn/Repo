import * as React from 'react';
import { ModalBody, Modal, ModalHeader, ModalFooter } from 'reactstrap';
import { Status } from '../../../types/intrasocial_types';
import StatusEditFormContainer from '../../general/StatusEditFormContainer';
import { translate } from '../../../localization/AutoIntlProvider';

import "./AttentionDialog.scss"

export interface Props 
{
    visible:boolean
    status:Status
    didCancel:() => void
}
interface State 
{
}
export default class AttentionDialog extends React.Component<Props, State> {  
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    renderHeader = () => {
        return (<>
                    <button type="button" className="close pull-right" onClick={this.props.didCancel}>
                        <span aria-hidden="true">&times;</span>
                        <span className="sr-only">{translate("common.close")}</span>
                    </button>
                    <span>{translate("status.dialog.attention.title")}</span>
                </>)
            }
    renderContent = () => {
        
        return (<div></div>)
    }
    renderFooter = () => {
        return null
    }
    render()
    {
        return (<Modal toggle={this.props.didCancel} id="edit-status-dialog" zIndex={1070} isOpen={this.props.visible} className="full-height">
                <ModalHeader>
                    {this.renderHeader()}
                </ModalHeader>
                <ModalBody className="vertical-scroll">
                    {this.renderContent()}
                </ModalBody>
                <ModalFooter>
                    {this.renderFooter()}
                </ModalFooter>
            </Modal>)
    }
}