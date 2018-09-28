import * as React from 'react';
import { ModalBody, Modal, ModalHeader, ModalFooter } from 'reactstrap';
import { translate } from '../../../../components/intl/AutoIntlProvider';
import { StatusUtilities } from '../../../../utilities/StatusUtilities';
require("./StatusPermalinkDialog.scss");

export interface OwnProps 
{
    statusId:number
    didCancel:() => void
}
export interface DefaultProps 
{
    visible:boolean
}
interface State 
{
}
type Props = DefaultProps & OwnProps
export default class StatusPermalinkDialog extends React.Component<Props, State> {  
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    render()
    {
        let permaLink = StatusUtilities.getPermaLink(this.props.statusId)
        let copyText = translate("Copy")
        return (<Modal toggle={this.props.didCancel} id="status-permalink-dialog" zIndex={1070} isOpen={this.props.visible} className="full-height">
                <ModalHeader>
                    {translate("Status Permalink")}
                </ModalHeader>
                <ModalBody className="vertical-scroll">
                    <p>{translate("Copy this link as the permanent URL for this item")}
                    </p>
                    <div className="input-group">
                        <pre className="form-control">
                            <a className="option-permalink" href={permaLink}
                                target="_blank">{permaLink}</a>
                        </pre>
                        <span className="input-group-btn">
                            <button id="status_option_copy_link" data-toggle="tooltip" data-placement="top"
                                data-clipboard-text={permaLink} data-original-title={copyText}
                                title={copyText} className="btn btn-default" type="button">
                                <span><i className="fa fa-copy"></i></span>
                            </button>
                        </span>
                    </div>
                </ModalBody>
                <ModalFooter>
                </ModalFooter>
            </Modal>)
    }
}