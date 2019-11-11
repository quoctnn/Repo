import * as React from 'react';
import { ModalBody, Modal, ModalHeader, ModalFooter } from 'reactstrap';
import { translate } from '../../../localization/AutoIntlProvider';

type OwnProps = {
    didComplete:(confirmed:boolean) => void
    title:string
    message:string 
    okButtonTitle?:string
}
type DefaultProps = {
    visible:boolean
}
interface State 
{
}
type Props = DefaultProps & OwnProps
export default class ConfirmDialog extends React.Component<Props, State> {  
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    didComplete = (success:boolean) => () => {
        this.props.didComplete(success)
    }
    render()
    {
        const okButtonTitle = this.props.okButtonTitle || translate("OK")
        return (<Modal toggle={this.didComplete(false)} id="status-permalink-dialog" zIndex={1070} isOpen={this.props.visible} className="full-height">
                <ModalHeader>
                    {this.props.title}
                </ModalHeader>
                <ModalBody className="vertical-scroll">
                    <p>{this.props.message}</p>
                </ModalBody>
                <ModalFooter>
                    <button type="button" className="btn btn-secondary" onClick={this.didComplete(false)}>{translate("Cancel")}
                    </button>
                    <button type="button" className="btn btn-danger" onClick={this.didComplete(true)}>{okButtonTitle}
                    </button>
                </ModalFooter>
            </Modal>)
    }
}