import * as React from 'react';
import { translate } from '../../../localization/AutoIntlProvider';
import SimpleDialog from './SimpleDialog';
import { Button } from 'reactstrap';

type OwnProps = {
    didClose:() => void
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
export default class AlertDialog extends React.Component<Props, State> {  
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    render()
    {
        const {okButtonTitle, visible, didClose, message, title} = this.props
        const buttonTitle = okButtonTitle || translate("OK")

        const footer = <Button color="secondary" onClick={didClose}>
                            {buttonTitle}
                        </Button>
        return <SimpleDialog header={title} visible={visible} didCancel={didClose} footer={footer}>
                    <p>{message}</p>
                </SimpleDialog>
    }
}