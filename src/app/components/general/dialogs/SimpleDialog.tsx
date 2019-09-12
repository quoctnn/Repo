import * as React from "react";
import {ModalBody, Modal, ModalHeader, ModalFooter, Button } from 'reactstrap';
import classnames = require("classnames");
import { translate } from "../../../localization/AutoIntlProvider";

type DefaultProps = {
    zIndex:number
    showCloseButton:boolean
    centered:boolean
    scrollable:boolean
    fade:boolean
}
type Props = {
    header?:React.ReactNode | JSX.Element
    children:React.ReactNode
    footer?:React.ReactNode
    visible:boolean
    didCancel:() => void
    className?:string
    onScroll?: (event: React.UIEvent<any>) => void
} & DefaultProps
type State =
{
}
export default class SimpleDialog extends React.Component<Props, State> {
    static defaultProps:DefaultProps = {
        zIndex:1070,
        showCloseButton:true,
        centered:true,
        scrollable:true,
        fade:true,
    }
    constructor(props:Props) {
        super(props);
        this.state = {
        }
    }
    renderCloseButton = () => {
        if(!this.props.showCloseButton)
            return null
        return <Button color="light" className="modal-close" onClick={this.props.didCancel}>
                <span className="sr-only">{translate("common.close")}</span>
                <i aria-hidden="true" className="fas fa-times"></i>
            </Button>
    }
    render() 
    {
        const cn = classnames(this.props.className, {"modal-dialog-scrollable":this.props.scrollable})
        return(
            <div>
                <Modal fade={this.props.fade} centered={this.props.centered} toggle={this.props.didCancel} zIndex={this.props.zIndex} isOpen={this.props.visible} className={cn}>
                    {
                        this.props.header && 
                        <ModalHeader>
                            {this.props.header}
                            {this.renderCloseButton()}
                        </ModalHeader>
                    }
                    <ModalBody className="vertical-scroll" onScroll={this.props.onScroll}>
                        {this.props.children}
                    </ModalBody>
                    {
                        this.props.footer && 
                        <ModalFooter>
                            {this.props.footer}
                        </ModalFooter>
                    }
                </Modal>
            </div>
        );
    }
}